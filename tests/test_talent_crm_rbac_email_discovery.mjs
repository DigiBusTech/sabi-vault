import assert from "assert";
import { globalCriteriaStore } from "../src/core/enterprise/criteria_store.ts";
import { globalUserStore } from "../src/core/vault/user_store.ts";
import { profileAndAdvisorStore } from "../src/core/vault/profile_store.ts";
import { globalTalentPoolService } from "../src/core/enterprise/talent_pool_service.ts";
import { globalTeamService, ROLE_PERMISSIONS } from "../src/core/enterprise/team_service.ts";
import { globalEmailService } from "../src/core/notifications/email_service.ts";
import { globalEmailTemplateStore } from "../src/core/notifications/email_template_store.ts";
import { globalDiscoveryEngine } from "../src/agents/discovery_engine.ts";

async function runTestSuite() {
  console.log("=== STARTING SABIPROFILE TALENT CRM, RBAC, EMAIL & DISCOVERY TEST SUITE ===");

  const testOrgId = "org_sovereign_consortium_99";
  const testCandidateId = "usr_chinwe_okafor_7721";

  // -------------------------------------------------------------
  // TEST 1: AUTO-CAPTURE OF EVALUATED CANDIDATE INTO TALENT CRM
  // -------------------------------------------------------------
  console.log("\n[Test 1] Testing Auto-Capture into Enterprise Talent Pool CRM...");

  // Mint a valid scoped key for Chinwe Okafor
  const keyRecord = await globalUserStore.mintKeyAsync({
    userId: testCandidateId,
    allowedScopes: ["academics", "experience", "skills", "finance"],
    ttlDays: 14,
    maxQueries: 100,
    label: "Talent CRM Ingestion Key",
  });
  assert(keyRecord && keyRecord.rawKey, "Scoped key must be generated");

  // Run evaluation with a labour rubric
  const evalResult = await globalCriteriaStore.evaluateCandidate(
    keyRecord.rawKey,
    "rubric_fintech_lead_eng",
    testOrgId
  );
  assert(evalResult, "Evaluation result must exist");
  assert(evalResult.verdict, "Evaluation must produce a verdict");

  // Verify candidate was automatically captured into Talent Pool CRM
  const applicants = globalTalentPoolService.listApplicants(testOrgId);
  assert(applicants.length > 0, "Candidate must be auto-captured into Talent Pool");

  const capturedApplicant = applicants.find((a) => a.candidateId === testCandidateId && a.orgId === testOrgId);
  assert(capturedApplicant, "Chinwe Okafor must exist in the captured talent pool for testOrgId");
  assert(capturedApplicant.fullName.includes("Chinwe"), "Full name must match Chinwe");
  assert.strictEqual(capturedApplicant.sector, "LABOUR");
  assert(capturedApplicant.compositeScore > 0, "Composite score must be > 0");
  assert(capturedApplicant.holisticMatchIndex, "HMI index must be computed");
  assert(capturedApplicant.holisticMatchIndex.overallHmiScore > 0, "Overall HMI score must be > 0");
  assert.strictEqual(
    capturedApplicant.holisticMatchIndex.tailoredInterviewProbes.length,
    3,
    "Exactly 3 tailored interview probes must be generated"
  );

  console.log(`✓ Auto-captured "${capturedApplicant.fullName}" into Talent Pool CRM!`);
  console.log(`  - Stage: ${capturedApplicant.pipelineStage} | Sector: ${capturedApplicant.sector}`);
  console.log(`  - Holistic Match Index (HMI): ${capturedApplicant.holisticMatchIndex.overallHmiScore}/100`);
  console.log(`  - Hidden Gem Status: ${capturedApplicant.holisticMatchIndex.isHiddenGem ? "💎 YES" : "Standard"}`);
  console.log(`  - Tailored Probe 1: ${capturedApplicant.holisticMatchIndex.tailoredInterviewProbes[0]}`);

  // -------------------------------------------------------------
  // TEST 2: TALENT POOL CRM PIPELINE STAGING, NOTES & FILTERING
  // -------------------------------------------------------------
  console.log("\n[Test 2] Testing Talent Pool Pipeline Operations & Collaboration...");

  const applicantId = capturedApplicant.id;

  // 1. Stage transition: e.g. move to INTERVIEW_SCHEDULED
  const updatedStageSuccess = await globalTalentPoolService.updateStage(applicantId, "INTERVIEW_SCHEDULED");
  assert(updatedStageSuccess, "Stage update must succeed");

  // 2. Add evaluator notes
  const note = await globalTalentPoolService.addNote(applicantId, {
    authorId: "eval_sarah_1",
    authorName: "Sarah Adeyemi",
    authorRole: "Principal Tech Screener",
    text: "Outstanding distributed systems depth. Tier-1 cryptographic proofs match experience claim. Recommended for final interview.",
  });
  assert(note, "Note addition must succeed");
  assert.strictEqual(note.authorName, "Sarah Adeyemi");
  assert(note.text.includes("cryptographic proofs"));

  // 3. Tagging
  const tagsUpdated = await globalTalentPoolService.updateTags(applicantId, [
    "Cloud Architect",
    "Terraform",
    "Top Tier Candidate",
  ]);
  assert(tagsUpdated, "Tag update must succeed");

  // 4. Query with filters
  const filteredInterview = globalTalentPoolService.listApplicants(testOrgId, {
    stage: "INTERVIEW_SCHEDULED",
    sector: "LABOUR",
    search: "Chinwe",
  });
  assert.strictEqual(filteredInterview.length, 1, "Filter by stage, sector, search must return matching candidate");
  assert.strictEqual(filteredInterview[0].evaluatorNotes.length, 1);
  assert.deepStrictEqual(filteredInterview[0].tags, ["Cloud Architect", "Terraform", "Top Tier Candidate"]);

  console.log(`✓ Talent Pool CRM updated: Stage moved to INTERVIEW_SCHEDULED, note appended, 3 tags added, search filter confirmed.`);

  // -------------------------------------------------------------
  // TEST 3: ENTERPRISE MULTI-SECTOR RBAC & PERMISSION MATRIX
  // -------------------------------------------------------------
  console.log("\n[Test 3] Testing Granular Multi-Sector Role-Based Access Control (RBAC)...");

  // Verify Role Permission Matrix integrity
  assert.strictEqual(ROLE_PERMISSIONS.ORG_OWNER.canManageTeam, true);
  assert.strictEqual(ROLE_PERMISSIONS.ORG_OWNER.canManageApiKeys, true);
  assert.strictEqual(ROLE_PERMISSIONS.ORG_ADMIN.canManageTeam, true);
  assert.strictEqual(ROLE_PERMISSIONS.CASE_OFFICER_RECRUITER.canScreenCandidates, true);
  assert.strictEqual(ROLE_PERMISSIONS.CASE_OFFICER_RECRUITER.canManageTeam, false, "Recruiters cannot manage team");
  assert.strictEqual(ROLE_PERMISSIONS.INTERVIEWER_EVALUATOR.canScheduleInterviews, true);
  assert.strictEqual(ROLE_PERMISSIONS.INTERVIEWER_EVALUATOR.canUpdatePipelineStatus, false, "Interviewers cannot advance pipeline stages");
  assert.strictEqual(ROLE_PERMISSIONS.INTERVIEWER_EVALUATOR.canScreenCandidates, false, "Interviewers only view and interview");
  assert.strictEqual(ROLE_PERMISSIONS.COMPLIANCE_AUDITOR.canViewAuditLogs, true);
  assert.strictEqual(ROLE_PERMISSIONS.COMPLIANCE_AUDITOR.canManageApiKeys, false, "Auditors cannot mint API keys");

  // Invite Recruiter
  const { member: invitedRecruiter, inviteLink: recruiterInviteLink } = await globalTeamService.inviteMember({
    orgId: testOrgId,
    email: "kwame.mensah@consortium.gov",
    fullName: "Kwame Mensah",
    role: "CASE_OFFICER_RECRUITER",
    invitedBy: "usr_director_1",
  });
  assert(invitedRecruiter && invitedRecruiter.id, "Recruiter invitation must be created");
  assert(recruiterInviteLink.includes("inviteToken="), "Invite link must contain inviteToken");
  assert.strictEqual(invitedRecruiter.status, "INVITED");
  assert(invitedRecruiter.activationToken, "Activation token must be minted");

  // Verify recruiter permissions via hasPermission
  assert.strictEqual(globalTeamService.hasPermission("CASE_OFFICER_RECRUITER", "canScreenCandidates"), true);
  assert.strictEqual(globalTeamService.hasPermission("CASE_OFFICER_RECRUITER", "canManageTeam"), false);

  // Invite Compliance Auditor
  const { member: invitedAuditor } = await globalTeamService.inviteMember({
    orgId: testOrgId,
    email: "fatima.al-mansoori@compliance.org",
    fullName: "Fatima Al-Mansoori",
    role: "COMPLIANCE_AUDITOR",
    invitedBy: "usr_director_1",
  });
  assert(invitedAuditor, "Auditor invitation must succeed");

  // Accept Recruiter invitation via token
  const activatedRecruiter = await globalTeamService.acceptInvitation(invitedRecruiter.activationToken);
  assert(activatedRecruiter, "Activation via token must succeed");
  assert.strictEqual(activatedRecruiter.status, "ACTIVE");
  assert(activatedRecruiter.joinedAt, "Joined timestamp must be recorded");

  // Update role and suspend
  await globalTeamService.updateMemberRole(invitedAuditor.id, "INTERVIEWER_EVALUATOR");
  await globalTeamService.updateMemberStatus(invitedAuditor.id, "SUSPENDED");

  const orgMembers = await globalTeamService.listMembers(testOrgId);
  assert(orgMembers.length >= 2, "Team member count must reflect invites");
  console.log(`✓ Granular RBAC verified across 5 role tiers with token-based invitation and status lifecycle.`);

  // -------------------------------------------------------------
  // TEST 4: DYNAMIC TRANSACTIONAL EMAIL & TEMPLATE STUDIO
  // -------------------------------------------------------------
  console.log("\n[Test 4] Testing Dynamic Transactional Email System & Template Studio...");

  // Verify pre-seeded system templates
  const systemTemplates = globalEmailTemplateStore.listTemplates();
  assert(systemTemplates.length >= 5, "Must have at least 5 pre-seeded system templates");
  assert(systemTemplates.some((t) => t.id === "tpl_talent_query_notice"));
  assert(systemTemplates.some((t) => t.id === "tpl_interview_invite"));
  assert(systemTemplates.some((t) => t.id === "tpl_imm_funds_deficit"));
  assert(systemTemplates.some((t) => t.id === "tpl_acad_apostille_deficit"));
  assert(systemTemplates.some((t) => t.id === "tpl_tamper_critical"));

  // Create a custom dynamic template
  const customTemplate = await globalEmailTemplateStore.saveTemplate({
    id: "CUSTOM_SCHOLARSHIP_ADMISSION",
    name: "Global University Full Fellowship Notification",
    subject: "Congratulations {{recipient_name}}: Full Scholarship Granted by {{organization_name}}",
    category: "EDUCATION",
    isActive: true,
    description: "Sent to admitted scholars with Tier-2 verified credentials",
    availableVariables: ["recipient_name", "organization_name", "program_name", "stipend_amount", "action_url"],
    bodyHtml: `
      <h2>Scholarship Decision Notification</h2>
      <p>Dear {{recipient_name}},</p>
      <p>We are delighted to inform you that your application for <strong>{{program_name}}</strong> has been accepted by {{organization_name}} with a full annual fellowship of <strong>{{stipend_amount}}</strong>.</p>
      <p><a href="{{action_url}}">Accept Fellowship Offer</a></p>
    `,
    bodyText: "Dear {{recipient_name}}, We are delighted to inform you that your application for {{program_name}} has been accepted.",
    updatedAt: new Date().toISOString(),
  });
  assert(customTemplate, "Custom template must be saved");

  // Send transactional email with variable interpolation
  const emailResult = await globalEmailService.sendEmail({
    templateId: "CUSTOM_SCHOLARSHIP_ADMISSION",
    recipientEmail: "chinwe.okafor@alumni.org",
    variables: {
      recipient_name: "Chinwe Okafor",
      organization_name: "African Institute of Advanced Technology",
      program_name: "MSc High Performance Distributed Computing",
      stipend_amount: "$36,000 USD / year",
      action_url: "https://sabiprofile.com/fellowship/accept?token=f991a",
    },
  });

  assert(emailResult.success, "Dynamic email dispatch must succeed");
  assert(emailResult.interpolatedSubject.includes("Chinwe Okafor"), "Subject must interpolate recipient name");
  assert(emailResult.interpolatedSubject.includes("African Institute of Advanced Technology"), "Subject must interpolate org name");
  assert(emailResult.interpolatedHtml.includes("$36,000 USD / year"), "HTML must interpolate stipend amount");

  // Verify dispatch telemetry log
  const dispatchLogs = globalEmailTemplateStore.listDispatchLogs();
  assert(dispatchLogs.length > 0, "Dispatch telemetry must record dispatch event");
  const latestLog = dispatchLogs[0];
  assert.strictEqual(latestLog.templateId, "CUSTOM_SCHOLARSHIP_ADMISSION");
  assert.strictEqual(latestLog.recipientEmail, "chinwe.okafor@alumni.org");
  assert.strictEqual(latestLog.status, "SENT");

  console.log(`✓ Dynamic Transactional Email verified: Custom template saved, variables interpolated, telemetry logged.`);

  // -------------------------------------------------------------
  // TEST 5: THE "RIGHT APPLICANT" DISCOVERY ENGINE (HMI & GEMS)
  // -------------------------------------------------------------
  console.log("\n[Test 5] Testing The Right Applicant Discovery Engine...");

  const labourRubric = globalCriteriaStore.getProfile("rubric_fintech_lead_eng");
  assert(labourRubric, "Labour rubric must exist");

  // Scenario A: Non-traditional background, strong practical code, clean Tier-1 vault
  const mockGemEvalResult = {
    candidateId: "usr_gem_1",
    keyId: "sbk_gem_key",
    sovereignNode: "NG-LOS-PRIMARY-01",
    verdict: "QUALIFIED",
    compositeScore: 88,
    integrityStatus: "TAMPER_FREE_VERIFIED",
    onChainTx: "0x7a8b...gem",
    scoresBreakdown: {
      academicsScore: 70, // Non-elite degree
      experienceScore: 92,
      certificationsScore: 85,
    },
    anomaliesDetected: [],
    citations: ["Verified Open Source Maintainer attestation in sovereign vault"],
    evaluatedAt: new Date().toISOString(),
  };

  const hiddenGemEvaluation = globalDiscoveryEngine.evaluateApplicant({
    evalResult: mockGemEvalResult,
    profile: {
      id: "usr_gem_1",
      userId: "usr_gem_1",
      fullName: "Tariq Danjuma",
      headline: "Self-Taught Rust & Systems Engineer",
      skills: [
        { name: "Rust", category: "Languages", proficiency: "Expert" },
        { name: "Distributed Consensus", category: "Architecture", proficiency: "Advanced" },
        { name: "Raft", category: "Protocols", proficiency: "Advanced" },
        { name: "Docker", category: "DevOps", proficiency: "Intermediate" },
        { name: "eBPF", category: "Systems", proficiency: "Advanced" },
      ],
      workExperiences: [
        {
          id: "w1",
          company: "Open Source Contributor",
          title: "Core Contributor",
          startDate: "2022-01",
          endDate: "2024-10",
          isCurrent: true,
          description: "Implemented high-throughput Paxos state machine; architected consensus engine achieving 150k TPS scale.",
        },
      ],
      educationList: [
        {
          id: "e1",
          institution: "Federal Polytechnic",
          degree: "National Diploma in Computer Engineering",
          fieldOfStudy: "Computer Engineering",
          startDate: "2019",
          endDate: "2021",
        },
      ],
      languages: [
        { language: "English", level: "Fluent" },
        { language: "Hausa", level: "Native" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    vault: {
      userId: "usr_gem_1",
      sovereignNode: "NG-LOS-PRIMARY-01",
      items: [
        {
          id: "v1",
          category: "experience",
          title: "Open Source Maintainer Attestation",
          verificationTier: "tier1_standard_hashed",
          sha256Hash: "6f5a3b...c",
          uploadedAt: new Date().toISOString(),
          isTampered: false,
        },
      ],
      financialSummary: {
        totalDeclared: 8000,
        currency: "USD",
        has28DayIntegrity: true,
        depositSpikeDetected: false,
      },
    },
    rubric: labourRubric,
  });

  assert(hiddenGemEvaluation.hmi.practicalExecutionIndex >= 80, "Practical execution index should be high for active repo contributor");
  assert.strictEqual(hiddenGemEvaluation.hmi.isHiddenGem, true, "Must be classified as a Hidden Gem (non-elite degree + exceptional practical artifacts)");
  assert.strictEqual(hiddenGemEvaluation.tailoredProbes.length, 3, "Must generate 3 tailored probes");
  console.log(`✓ Hidden Gem detection confirmed: Tariq Danjuma (Practical: ${hiddenGemEvaluation.hmi.practicalExecutionIndex}, HMI: ${hiddenGemEvaluation.hmi.overallHmiScore}) -> 💎 Hidden Gem Flag: TRUE`);

  // Scenario B: Pedigree Inflation Warning (Ivy PhD claim, zero practical work, zero impact)
  const mockInflatedEvalResult = {
    candidateId: "usr_inflated_1",
    keyId: "sbk_inflated_key",
    sovereignNode: "UK-LON-PRIMARY-01",
    verdict: "CONDITIONALLY_QUALIFIED",
    compositeScore: 68,
    integrityStatus: "TAMPER_FREE_VERIFIED",
    onChainTx: "0x8f2a...inflated",
    scoresBreakdown: {
      academicsScore: 98, // Ivy League PhD
      experienceScore: 20,
    },
    anomaliesDetected: ["No verified employer reference letters in sovereign vault"],
    citations: ["Candidate boasts elite academic degree"],
    evaluatedAt: new Date().toISOString(),
  };

  const pedigreeInflationEvaluation = globalDiscoveryEngine.evaluateApplicant({
    evalResult: mockInflatedEvalResult,
    profile: {
      id: "usr_inflated_1",
      userId: "usr_inflated_1",
      fullName: "Lord Arthur Sterling",
      headline: "PhD Computer Science (Elite Ivy League)",
      skills: [{ name: "Strategic AI Vision", category: "General", proficiency: "Expert" }],
      workExperiences: [],
      educationList: [
        {
          id: "e1",
          institution: "Elite Ivy League University",
          degree: "Doctor of Philosophy (PhD) in AI",
          fieldOfStudy: "Computer Science",
          startDate: "2018",
          endDate: "2024",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    vault: {
      userId: "usr_inflated_1",
      sovereignNode: "UK-LON-PRIMARY-01",
      items: [], // Zero practical artifacts, zero open source code, zero employment proofs
      financialSummary: {
        totalDeclared: 150000,
        currency: "GBP",
        has28DayIntegrity: false,
        depositSpikeDetected: true,
      },
    },
    rubric: labourRubric,
  });

  assert.strictEqual(
    pedigreeInflationEvaluation.hmi.hasPedigreeDivergenceWarning,
    true,
    "Candidate with top degree claim but zero practical artifacts must trigger Pedigree Divergence Warning"
  );
  console.log(`✓ Pedigree Inflation detection confirmed: Lord Arthur Sterling -> ⚠️ Warning: TRUE (${pedigreeInflationEvaluation.hmi.pedigreeWarningReason})`);

  console.log("\n=========================================================================");
  console.log("🎉 ALL 5 TEST SUITES PASSED! TALENT CRM, RBAC, EMAIL & DISCOVERY VERIFIED!");
  console.log("=========================================================================");
}

runTestSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
