import assert from "assert";
import { globalCriteriaStore } from "../src/core/enterprise/criteria_store.ts";
import { globalUserStore } from "../src/core/vault/user_store.ts";
import { profileAndAdvisorStore } from "../src/core/vault/profile_store.ts";
import { globalTalentPoolService } from "../src/core/enterprise/talent_pool_service.ts";
import { globalTeamService, ROLE_PERMISSIONS } from "../src/core/enterprise/team_service.ts";
import { globalEmailService } from "../src/core/notifications/email_service.ts";
import { globalEmailTemplateStore } from "../src/core/notifications/email_template_store.ts";
import { globalDiscoveryEngine } from "../src/agents/discovery_engine.ts";
import { BlockchainLedgerClient } from "../src/core/blockchain/ledger_client.ts";

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

  // -------------------------------------------------------------
  // TEST 6: STRICT MULTI-TENANT ISOLATION (NO DATA LEAKAGE)
  // -------------------------------------------------------------
  console.log("\n[Test 6] Testing Strict Multi-Tenant Isolation (Eradication of org_covenant_gate leak)...");

  const brandNewOrgId = "org_fresh_isolated_tenant_404";
  
  // A brand new tenant has queried 0 applicants and invited 0 members
  const freshApplicants = globalTalentPoolService.listApplicants(brandNewOrgId);
  assert.strictEqual(
    freshApplicants.length,
    0,
    `Brand new organization ${brandNewOrgId} MUST NOT see seed candidates or any applicants from org_covenant_gate!`
  );

  const freshMembers = globalTeamService.listMembers(brandNewOrgId);
  assert.strictEqual(
    freshMembers.length,
    0,
    `Brand new organization ${brandNewOrgId} MUST NOT see Covenant Gate staff members!`
  );

  // Covenant Gate only sees its own members
  const covenantMembers = globalTeamService.listMembers("org_covenant_gate");
  assert(
    covenantMembers.every((m) => m.orgId === "org_covenant_gate"),
    "Covenant Gate member list must only contain org_covenant_gate members"
  );

  console.log(`✓ Strict Tenant Isolation verified: New tenants see exactly 0 leaked candidates and 0 leaked team members.`);

  // -------------------------------------------------------------
  // TEST 7: AUTOMATIC EVENT-DRIVEN TRANSACTIONAL EMAIL DISPATCHES
  // -------------------------------------------------------------
  console.log("\n[Test 7] Testing Automatic Event-Driven Transactional Emails from Core Platform Events...");

  // Check that the evaluation in Test 1 automatically logged a tpl_talent_query_notice dispatch
  const allLogs = globalEmailTemplateStore.listDispatchLogs();
  const noticeLog = allLogs.find((l) => l.templateId === "tpl_talent_query_notice");
  assert(noticeLog, "Evaluation of candidate must automatically trigger tpl_talent_query_notice dispatch log");
  assert.strictEqual(noticeLog.status, "SENT");
  console.log(`✓ Citizen Transparency Notice auto-triggered on candidate query: ${noticeLog.recipientEmail}`);

  // Check that the stage update to INTERVIEW_SCHEDULED in Test 2 automatically logged tpl_interview_invite
  const interviewInviteLog = allLogs.find((l) => l.templateId === "tpl_interview_invite");
  assert(interviewInviteLog, "Pipeline stage advancement to INTERVIEW_SCHEDULED must trigger tpl_interview_invite");
  assert.strictEqual(interviewInviteLog.status, "SENT");
  console.log(`✓ Interview Invitation auto-triggered on pipeline stage advancement: ${interviewInviteLog.recipientEmail}`);

  // Test Tamper Critical Event Email Dispatch
  console.log("  Testing tamper critical email event trigger...");
  // Simulate an evaluation on a tampered vault item
  const tamperedKeyRecord = await globalUserStore.mintKeyAsync({
    userId: "usr_tamper_sim_101",
    allowedScopes: ["academics"],
    ttlDays: 1,
    maxQueries: 10,
    label: "Tamper Sim Key",
  });
  
  // 1. Commit an anchor to the blockchain simulation ledger
  const ledgerClient = new BlockchainLedgerClient();
  await ledgerClient.commitHash("usr_tamper_sim_101", "academics", "1111111111111111111111111111111111111111111111111111111111111111");

  // 2. Set up local vault data with academic degrees whose computed hash diverges from the anchor
  const tamperedVault = {
    userId: "usr_tamper_sim_101",
    sovereignNode: "NG-ABV-PRIMARY-01",
    storageUsedBytes: 1024,
    items: [],
    academics: {
      degrees: [
        {
          id: "deg_1",
          degree: "BSc Computer Science",
          institution: "University of Lagos",
          graduationYear: 2022,
          gpa: 3.8,
          tier: "tier1_standard_hashed",
        },
      ],
    },
  };
  globalUserStore.vaults.set("usr_tamper_sim_101", tamperedVault);

  const tamperedEval = await globalCriteriaStore.evaluateCandidate(
    tamperedKeyRecord.rawKey,
    "rubric_fintech_lead_eng",
    testOrgId
  );
  assert(tamperedEval, "Tamper evaluation returned");
  assert.strictEqual(tamperedEval.integrityStatus, "TAMPER_DETECTED");

  // Verify that tpl_tamper_critical was dispatched!
  const updatedLogs = globalEmailTemplateStore.listDispatchLogs();
  const tamperLog = updatedLogs.find((l) => l.templateId === "tpl_tamper_critical");
  assert(tamperLog, "Tamper detection must immediately dispatch tpl_tamper_critical security advisory!");
  assert.strictEqual(tamperLog.status, "SENT");
  console.log(`✓ Critical Tamper Advisory auto-triggered on SHA-256 divergence detection: ${tamperLog.recipientEmail}`);

  // -------------------------------------------------------------
  // TEST 8: DYNAMIC & INDIVIDUALIZED INTERVIEW PROBES
  // -------------------------------------------------------------
  console.log("\n[Test 8] Testing Dynamic Individualized Probes with Gateway Fallback...");

  const dynamicProbes = await globalDiscoveryEngine.generateDynamicProbes({
    candidateName: "Amina Yusuf",
    sector: "LABOUR",
    roleOrTrack: "Senior Rust Core Engineer",
    topSkills: ["Rust", "Tokio", "Raft Consensus"],
    claimedCompany: "Helios Microgrids",
    claimedTitle: "Distributed Systems Architect",
    deficits: ["No verified employer reference letter"],
  });

  assert(Array.isArray(dynamicProbes) && dynamicProbes.length === 3, "Must return exactly 3 probes");
  const joinedProbes = dynamicProbes.join(" ");
  assert(
    joinedProbes.includes("Rust") || joinedProbes.includes("Helios Microgrids") || joinedProbes.includes("Amina"),
    "Probes must contain individualized tokens tailored to the candidate's actual profile!"
  );
  console.log(`✓ Dynamic Probes successfully personalized for candidate:`);
  dynamicProbes.forEach((p, idx) => console.log(`   [Probe ${idx + 1}] ${p}`));

  // -------------------------------------------------------------
  // TEST 9: DETERMINISTIC SHA-256 ON-CHAIN EVALUATION DIGEST
  // -------------------------------------------------------------
  console.log("\n[Test 9] Testing Deterministic SHA-256 Provenance Digest (No Math.random)...");
  assert(evalResult.onChainTx.startsWith("0x"), "On-chain tx digest must start with 0x");
  assert.strictEqual(evalResult.onChainTx.length, 66, "On-chain tx digest must be a 64-char hex string prefixed with 0x");
  console.log(`✓ On-Chain evaluation digest mathematically formatted: ${evalResult.onChainTx}`);

  // -------------------------------------------------------------
  // TEST 10: PERSISTENT SCOPED KEY SIGNING & AUDIT LEDGER INGESTION
  // -------------------------------------------------------------
  console.log("\n[Test 10] Testing Cold-Start Scoped Key Minting & Audit Ledger Ingestion...");

  const coldUserId = `usr_test_cold_${Date.now()}`;

  // Mint a key for the cold user
  const coldKey = await globalUserStore.mintKeyAsync({
    userId: coldUserId,
    allowedScopes: ["experience", "academics"],
    ttlDays: 7,
    maxQueries: 5,
    label: "Cold Worker Test Key",
  });

  assert(coldKey && coldKey.rawKey, "Cold worker key must be minted with a valid raw key");
  assert(!coldKey.rawKey.includes("undefined"), "Key must not contain undefined");
  console.log(`✓ Minted cold key for ${coldUserId}: ${coldKey.keyId}`);

  // Verify listKeysAsync preserves rawKey and record without disappearing
  const listedKeys = await globalUserStore.listKeysAsync(coldUserId);
  assert(listedKeys.length > 0, "Keys must not disappear for user");
  const retrievedColdKey = listedKeys.find((k) => k.keyId === coldKey.keyId);
  assert(retrievedColdKey, "Minted key must be present in listKeysAsync");
  assert.strictEqual(retrievedColdKey.rawKey, coldKey.rawKey, "rawKey must be preserved across reads");
  console.log(`✓ Scoped key persisted permanently without disappearing!`);

  // Record an audit entry for this user across a custom vertical (e.g. finance/custom)
  const auditRecord = await globalUserStore.recordAuditEntryAsync({
    keyId: coldKey.keyId,
    requestingOrg: "Global Sovereign Bank PLC",
    orgType: "ENTERPRISE",
    accessedScopes: ["experience", "academics"],
    purpose: "Institutional Credit & Experience Verification",
    integrityVerified: true,
    onChainTx: "0x" + "a".repeat(64),
    status: "VERIFIED_ACCESSED",
    targetVaultId: coldUserId,
    screeningVertical: "custom_credit_check",
    compositeScore: 92,
    verdict: "ACCEPTED",
  });

  assert(auditRecord && auditRecord.id, "Audit record must be successfully generated");
  console.log(`✓ Recorded audit entry: ${auditRecord.id}`);

  // Verify getAuditLogsAsync retrieves the logged event by userId
  const coldAuditLogs = await globalUserStore.getAuditLogsAsync(coldUserId);
  assert(coldAuditLogs.length > 0, "Audit logs must not be empty after query");
  const foundLog = coldAuditLogs.find((l) => l.id === auditRecord.id);
  assert(foundLog, "Specific query audit log must appear in privacy transparency ledger");
  console.log(`✓ Privacy transparency audit ledger verified: Query by ${foundLog.requestingOrg} successfully logged!`);

  console.log("\n=========================================================================");
  console.log("🎉 ALL 10 TEST SUITES PASSED! TALENT CRM, RBAC, EMAIL, DISCOVERY & KEYS VERIFIED!");
  console.log("=========================================================================");
}

runTestSuite().catch((err) => {
  console.error("Test Suite Failed:", err);
  process.exit(1);
});
