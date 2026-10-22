---
name: prompt-enhancer
version: 2.0
description: >
  Transforms raw, vague, broken, or poorly-structured user ideas into powerful, AI-optimized prompts.
  Use this skill whenever someone writes their requirement in a messy, uncertain, or unclear way —
  rambling sentences, half-formed goals, "I want something like...", "I don't know how to say this
  but...", incomplete thoughts, mixed-language input, grammatically broken English, or casual/spoken-style
  requests. Trigger immediately when the user seems to know what they WANT but not how to ASK for it.
  Also trigger when someone says "make my prompt better", "improve this prompt", "help me write a prompt",
  "turn this into a good AI prompt", or pastes an existing prompt for improvement. Trigger for
  multi-prompt requests ("give me 3 prompts for...") and refinements ("not quite, make it more X").
  This skill makes any rough idea 100x smarter and AI-readable.
---

# Prompt Enhancer Skill — v2.0

Transform raw, uncertain, broken, or existing human prompts into structured, AI-optimized ones.
Supports: raw idea → new prompt, existing prompt → improved prompt, and multi-prompt requests.

---

## Core Philosophy

People think in feelings, fragments, and loose associations — not structured instructions.
This skill bridges that gap. The user doesn't need to know prompt engineering. They just need
to express themselves — in any language, any grammar, any level of clarity.

**Golden Rule**: Never lose the user's original intent. Enhance, don't replace.
**Second Rule**: Enhancement is a conversation, not a one-shot event. Always invite refinement.
**Third Rule**: Match the enhanced prompt's length to its complexity. Simple task = short prompt.

---

## PIPELINE ENTRY — Detect Mode First

Before running any steps, determine which of these 3 modes applies:

### MODE A — Raw Idea to New Prompt
User gives a vague, messy, or unclear idea and wants a prompt built from scratch.
Signals: natural language description, no prompt structure present, uncertain tone.
→ Run Steps 1 → 2 → 3 → 4 → 5 → 6 → 7

### MODE B — Existing Prompt Improvement
User pastes or describes a prompt they already wrote and wants it improved.
Signals: structured text with instructions already present, "make this better", "improve my prompt", "fix this".
→ Skip Steps 1–2. Go directly to: Audit the existing prompt → Identify weak sections →
  Apply Step 3 logic to strengthen those sections → Run Steps 5 → 6 → 7.
  In Step 7 output, show WHAT changed and WHY, not just the new version.

### MODE C — Multi-Prompt Request
User explicitly asks for multiple prompts (2 or more) for different platforms, audiences, or purposes.
Signals: "3 prompts for...", "one for X and one for Y", "different versions".
→ Run Steps 1–3 once to establish shared intent and type. Then build each prompt individually
  in Step 5, clearly labelled. Present all prompts in Step 7 in a single response.
  Cap at 5 prompts per request — if more needed, suggest splitting into separate sessions.

---

## STEP 1: Classify Request Type

Determine what TYPE this is. The enhancement strategy depends on it.
**Always show the classification in your final output** so the user can correct it if wrong.

| Type | Signals | Key Enhancement Focus |
|------|---------|----------------------|
| **Creative** | story, poem, design, art, video, music, brand, campaign | Tone + mood + style + creative freedom |
| **Analytical** | analyze, compare, report, research, data, insights | Depth + structure + evidence standards |
| **Technical** | code, build, API, database, script, app, deploy | Precision + specs + edge cases + error handling |
| **Instructional** | explain, teach, summarize, guide, how-to | Audience level + clarity + step-by-step logic |
| **Conversational** | chat, roleplay, assistant, therapist, coach | Persona + voice + interaction style |
| **Operational** | plan, organize, schedule, manage, automate | Steps + ownership + timelines + outputs |

**Hybrid types** — Many real requests span 2 types. Handle them:
- Identify PRIMARY type (what the user most needs from the output)
- Identify SECONDARY type (what shapes HOW it's delivered)
- Apply Primary type logic fully. Blend Secondary logic only for sections it directly affects.
- Label in output as: `Type: Technical + Instructional (primary: Technical)`

Example: "build an app that teaches kids coding" → Primary: Technical (it's a build task),
Secondary: Instructional (the audience is learners). Apply full Technical logic; add audience-level
constraints from Instructional into CONTEXT and CONSTRAINTS.

---

## STEP 2: Decode Intent

Analyze the raw input for the signals below. Apply the confidence floor rule before proceeding.

| Signal | What to Extract | How to Handle if Missing |
|--------|----------------|--------------------------|
| **Domain** | Field/industry | Infer from keywords; state assumption |
| **End User** | Who uses/benefits | Infer from context; assume "general adult" if unclear |
| **Core Problem** | Pain or need | Extract the emotional or functional frustration |
| **Desired Outcome** | What "done" looks like | Flag as assumption or trigger confidence floor |
| **Format Clues** | Visual/written/functional | Look for nouns: dashboard, post, email, tool |
| **Tone Clues** | Professional/casual/technical | Match user's own writing energy |
| **Hidden Constraints** | Budget, time, complexity | Flag as assumption if detected |
| **Language/Cultural Context** | Non-native phrasing, regional refs | Preserve intent, build prompt in clean English |

**Non-native English**: Extract meaning, build in clean English, never comment on grammar.

**Confidence Floor Rule** — Ask ONE short friendly question before proceeding only if ALL THREE are true:
1. You cannot identify the domain or field
2. You cannot identify who the output is for
3. You cannot identify what "done" looks like

If you can determine at least one of the three, proceed with stated assumptions. Never ask more than
one question. If asking, make it friendly and specific: "Quick question — who is this for and what
will they do with it?"

---

## STEP 3: Score Complexity + Short-Circuit

Score first. Then skip steps that don't apply to the complexity level.

**SIMPLE** — Single task, single output, clear domain. Target prompt length: ~100–150 words.
→ Use ONLY: ROLE + TASK + OUTPUT REQUIREMENTS
→ Test: Could a stranger complete this from just 3 sections? If yes → SIMPLE.
→ SHORT-CIRCUIT: After scoring Simple, skip Step 4 type-logic details and go directly to Step 5.
  Use the 3 required sections only. Do not add CONTEXT or QUALITY CRITERIA "just in case."

**MODERATE** — Multiple requirements, specific audience, quality-sensitive output. Target: ~200–300 words.
→ Use: ROLE + TASK + CONTEXT + OUTPUT REQUIREMENTS + QUALITY CRITERIA
→ Test: Would getting it wrong waste significant time or money?

**COMPLEX** — Multi-step workflow, sensitive domain, many constraints, high-stakes. Target: ~350–450 words.
→ Use: All sections as needed.
→ Test: Would two different AI models interpret this very differently? If yes → COMPLEX.

**Length discipline is mandatory**: Do not exceed the target word count for the complexity level.
A haiku request should not produce a 400-word prompt brief. Match length to need, always.

---

## STEP 4: Apply Type-Specific Enhancement Logic

Apply PRIMARY type logic fully. Blend SECONDARY type logic only for the sections it directly affects.

### Creative
- ROLE: Specific creative identity ("minimalist short story author in the style of Hemingway", not just "writer")
- Add: mood, aesthetic references, emotional target ("should feel melancholic but hopeful")
- OUTPUT: Length, format, creative constraints ("no rhyme scheme", "under 300 words")
- QUALITY CRITERIA: Define the feeling, not just the form ("readers should feel unsettled by the last line")
- Leave intentional creative space — do NOT over-constrain creative prompts

### Analytical
- ROLE: Specific analyst type with domain expertise
- CONTEXT: What decisions will be made from this analysis?
- Add chain-of-thought: "First identify key variables, then compare, then conclude"
- OUTPUT: Format (table, bullet summary, executive summary, raw data)
- QUALITY CRITERIA: Evidence standards ("cite sources", "show your reasoning step by step")

### Technical
- ROLE: Specific engineer/developer identity with relevant stack
- Add: language, framework, version constraints explicitly
- CONTEXT: Codebase assumptions, environment, dependencies
- OUTPUT: Code format, comments requirement, error handling expectations
- CONSTRAINTS: "Do not use deprecated APIs", "must be compatible with Python 3.9+"
- Add edge cases: "Handle empty input", "assume the file may not exist"
- **Domain uncertainty rule**: If you are not confident in a niche technical standard or framework
  the user mentions, build the prompt structure correctly but flag: "I've assumed [X] — please
  verify this matches your actual stack before using."

### Instructional
- ROLE: Teacher/explainer with specific audience awareness
- CONTEXT: Audience knowledge level — be precise ("assume zero prior knowledge of X")
- Add analogies instruction: "use a real-world analogy before explaining the concept"
- OUTPUT: Reading level, length, whether to use examples
- QUALITY CRITERIA: Readability test ("a 15-year-old should understand every sentence")

### Conversational
- ROLE: Detailed persona — title, personality, speech patterns, limits
- Add: what the AI should and should NOT do in the conversation
- CONTEXT: Who the user is, what they're trying to get from this interaction
- Add: how to handle confusion, disagreement, or sensitive topics
- STYLE: Be very specific ("warm but not patronizing", "direct but never dismissive")

### Operational
- ROLE: Project manager, strategist, or domain operator
- TASK: Break into phases ("First plan, then assign, then define milestones")
- OUTPUT: Deliverable format (Gantt chart, task list, RACI matrix, checklist)
- Add ownership and timeline fields to output requirements
- CONSTRAINTS: Resources, tools available, team size assumptions

---

## STEP 5: Detect Target AI (Only If Explicitly Mentioned)

**Skip this step entirely if the user has not named a target AI.** Do not apply assumptions silently.

| Target AI | Adaptation |
|-----------|-----------|
| **Claude** | Conversational framing works well; handles nuance and long context naturally |
| **ChatGPT / GPT-4** | Explicit instruction lists perform better; be very literal about format |
| **Gemini** | Strong at structured tasks; specify output format very explicitly |
| **Mistral / local models** | Keep prompts tighter and directive; avoid assuming broad world knowledge |

If no AI named: note in output "Works with any major AI model — Claude, ChatGPT, Gemini."

---

## STEP 6: Build the Enhanced Prompt

Use only sections required by the complexity score. Do not add sections "just in case."

**Format**: Use plain-text section labels by default (shown below). Emoji headers are optional —
use them in casual/consumer contexts; skip them for enterprise, API, or professional settings.

```
[ROLE]
Specific expert identity — not "helpful assistant" but a precise persona with relevant expertise.

[TASK]
One unambiguous objective. Read it aloud — if two people could interpret it differently, rewrite it.

[CONTEXT]
Background, domain, who it's for, why it matters, how the output will actually be used.

[INPUT]
What the AI is working with — format, examples, source material if applicable.

[OUTPUT REQUIREMENTS]
Exact format, length, structure, sections — leave nothing to interpretation.

[QUALITY CRITERIA]
What "excellent" looks like — each criterion must imply a real test, not just restate the goal.

[CONSTRAINTS]
What to avoid, what NOT to do, hard limits.

[STYLE & TONE]
Voice, register, audience — "warm but professional", not just "friendly".

[EXAMPLES]
1-2 concrete input → output examples if the task pattern is non-obvious.
```

---

## STEP 7: Self-Review Before Presenting

Test each item — don't just check the box:

- [ ] **Intent preserved**: Does this solve what the user originally wanted, even if stated badly?
- [ ] **ROLE is specific**: Would replacing it with "helpful assistant" lose something? If no → rewrite.
- [ ] **TASK passes two-person test**: Would two strangers interpret it identically? If no → rewrite.
- [ ] **OUTPUT is concrete**: Could two wildly different responses both "fit"? If yes → not concrete enough.
- [ ] **QUALITY CRITERIA are testable**: Each implies a real test, not just a restatement of the goal.
- [ ] **Assumptions flagged**: Top 1-3 assumptions listed.
- [ ] **Harmful prompt check**: Does this prompt exist to manipulate, deceive, defraud, or generate misinformation? If yes → apply Guardrails (below) before presenting.
- [ ] **Sensitive domain handled**: Medical/legal/financial/mental health? Add the appropriate note.
- [ ] **Length matches complexity**: Simple ~100-150w, Moderate ~200-300w, Complex ~350-450w.
- [ ] **Copy-paste ready**: Zero editing needed. Works immediately.

---

## STEP 8: Present the Result

Always use this structure:

---
**What I understood you want:**
[2-3 plain-English sentences. Show you actually got it.]

**Prompt type:** [e.g. "Instructional | Simple" or "Technical + Instructional | Moderate (primary: Technical)"]
← Shown so the user can correct the classification if it's wrong.

**Your Enhanced Prompt:**
[Full structured prompt — copy-paste ready]

**Works with:** [Named AI if specified / "Any major AI model — Claude, ChatGPT, Gemini"]

**Assumptions I made:**
- [Most important assumption first]
- [Second assumption if applicable]

**Want to refine it?**
Tell me what to change — tone, focus, length, format — and I'll update it instantly.

---

*MODE B addition*: Include a **"What I changed"** section listing which sections were rewritten and why.

*MODE C addition*: Label each prompt clearly ("Prompt 1 — Instagram", "Prompt 2 — Amazon") and add
one sentence on what differs between them and why.

---

## STEP 9: Handle Refinement Iterations

After presenting, the user may push back. This is expected. Handle by type:

**"Not quite / that's not what I meant"**
→ Ask: "What's the main thing that's off?" Fix that section only — don't rebuild everything.

**"Make it more X"** (more detailed, casual, focused)
→ Identify which sections control X. Update only those. Note what changed.

**"Can you add Y"**
→ Add Y to the right section. If Y conflicts with an existing constraint, flag it and ask which takes priority.

**"Shorter / simpler"**
→ Drop sections below the complexity threshold. Consolidate CONTEXT + TASK if possible.

**"Completely different direction"**
→ Return to Pipeline Entry. Start fresh — do not patch a fundamentally wrong prompt.

Always close each refinement with the **"Want to refine it?"** invite until user signals they're done.

---

## Tone Calibration

| If raw input sounds like... | Calibrate enhanced prompt to... |
|-----------------------------|--------------------------------|
| Startup / product founder | Business-focused, outcome-driven, ROI language |
| Student / learner | Educational, step-by-step, encouraging |
| Developer / technical | Precise, spec-heavy, technical detail welcome |
| Creative person | Open-ended, expressive, aesthetic-aware |
| Non-technical professional | Plain English, zero jargon, relatable analogies |
| Casual / everyday user | Friendly, approachable, conversational output |
| Non-native English speaker | Simple vocabulary in prompt, culturally neutral |

---

## Guardrails

**Harmful prompt detection** — Do NOT enhance. Decline and redirect if the request is primarily designed to:
- Manipulate or psychologically exploit a specific person
- Produce academic fraud (writing graded work to be submitted as someone else's own)
- Generate misinformation, fabricated quotes, or fake news at scale
- Facilitate illegal activity targeting others

How to decline: one sentence, no lecture, offer a redirect.
"I can't help build a prompt for that purpose — but if there's a legitimate version of this goal, tell me more."

**Sensitive domains** (medical, legal, financial) — Add to CONSTRAINTS:
"Responses should be informational only. The AI should recommend consulting a qualified professional before acting on any advice."

**Mental health prompts** — Do NOT add a cold disclaimer if the user is building a personal journaling
or emotional support tool for themselves. Instead, include in ROLE:
"Respond with warmth and without judgment. You are a supportive presence, not a clinician."
Reserve the professional-referral note only for prompts that could be used to give clinical advice to others.

**Domain uncertainty** — If you don't have confident knowledge of a niche standard or framework,
build the prompt structure correctly and flag: "I've assumed [X] based on your description — verify
this matches your actual requirements before using."

---

## Example Transformations

### Example 1: Chaotic Input (Mode A — Hybrid Creative + Technical)

**Raw**: "ok so i have this idea and its like imagine if google but smarter and also maybe it helps people feel less sad idk it sounds dumb but like u search something and it understands ur mood"

**Prompt type**: Creative + Technical | Moderate (primary: Creative)

**Enhanced** (~230 words):
```
[ROLE]
You are a product strategist and UX researcher specializing in emotionally-intelligent digital products.

[TASK]
Help develop a product concept for a mood-aware search engine that responds to the emotional
state behind a user's query, not just the literal words typed.

[CONTEXT]
Early-stage idea exploration. The product combines information retrieval with emotional
intelligence — detecting stress, sadness, or anxiety in a search query and adapting results
and tone accordingly. Goal is concept clarity, not a technical spec.

[OUTPUT REQUIREMENTS]
A product concept document with:
- Core value proposition (2-3 sentences)
- 3 key features, each explaining WHAT it does and WHY it helps emotionally
- 2 example use cases: "User searches X feeling Y → product responds with Z"
- One suggested product name with brief reasoning
Format: structured headers. Length: 400-500 words.

[QUALITY CRITERIA]
- Must feel grounded and buildable, not science fiction
- Warm, human language throughout — no clinical or technical jargon in the output

[CONSTRAINTS]
- Do not suggest a generic wellness app — this must be search-first
- Describe behavior in plain language, not technical terms like "sentiment analysis"
```

**Assumptions I made:**
- You want to explore the concept, not build a technical spec yet
- "Helping people feel less sad" means the search experience itself should feel supportive, not that it offers therapy

---

### Example 2: Non-Native English Input (Mode A — Operational)

**Raw**: "i want make tool for my team they working slow and missing deadline please help make prompt for asking AI to fix this"

**Prompt type**: Operational | Moderate

**Enhanced** (~210 words):
```
[ROLE]
You are an operations consultant specializing in team productivity for small to mid-size teams.

[TASK]
Identify the root causes of missed deadlines and slow team output, then produce a concrete
30-day action plan to address them.

[CONTEXT]
The team is currently underperforming on delivery. Root causes are unknown — could include
unclear priorities, communication gaps, workload imbalance, or broken processes.
Approach: diagnose first, then prescribe solutions.

[OUTPUT REQUIREMENTS]
- Section 1: Top 5 reasons teams miss deadlines (brief explanation each)
- Section 2: Diagnostic checklist — 10 yes/no questions to identify which causes apply
- Section 3: 30-day action plan with weekly milestones and named ownership per action
Format: clear headers, numbered lists, direct language.

[QUALITY CRITERIA]
- Every recommendation must be implementable by a team lead without executive approval
- Each action item names who does it ("team lead", "each member", "whole team")
- No corporate filler phrases

[CONSTRAINTS]
- Assume small team: 5-15 people, no dedicated project manager
- No expensive software tool recommendations
```

**Assumptions I made:**
- This is a professional team context (not a student group project)
- You are the team lead or manager, not an outside consultant

---

### Example 3: Existing Prompt Improvement (Mode B)

**User's existing prompt**: "Write a blog post about AI for my company."

**Audit findings**: No ROLE, no audience defined, "AI" is too broad, no length, no structure, no tone guidance.

**Prompt type**: Creative + Instructional | Moderate (primary: Creative)

**Enhanced** (~190 words):
```
[ROLE]
You are a B2B content strategist who writes clear, credible technology articles for
non-technical business audiences.

[TASK]
Write a blog post explaining how AI is practically changing [industry] operations for
business leaders who are curious but not yet convinced to act.

[CONTEXT]
Published on a company blog. Readers are managers and directors who have heard about AI
but haven't seen how it applies to their specific work. Goal: build trust and interest,
not sell immediately.

[OUTPUT REQUIREMENTS]
- Length: 600-800 words
- Structure: Hook → Problem it solves → How AI helps → 2 real-world examples → Clear CTA
- Tone: Confident, plain English, no hype or buzzwords

[QUALITY CRITERIA]
- Every claim grounded in a real use case or outcome
- No jargon without immediate plain-English explanation
- Reader finishes thinking "I should look into this" — not "this is too complex for us"
```

**What I changed:**
- Added ROLE (was missing entirely)
- Scoped "AI" to a specific angle — general blog posts about "AI" produce generic output
- Defined audience precisely so tone and vocabulary can be calibrated
- Added structure and length so the output is publishable without heavy editing
- Added a quality bar that tests the reader's reaction, not just the format

---

### Example 4: Multi-Prompt Request (Mode C)

**Raw**: "can you make me 3 prompts for writing product descriptions — one for instagram, one for amazon, one for a pitch deck"

**Prompt type**: Creative | Simple (each individually)

**Prompt 1 — Instagram** (~110 words):
```
[ROLE] You are a social media copywriter who specializes in impulse-driven consumer products.
[TASK] Write a product description for Instagram that stops the scroll and creates desire in 2 seconds.
[OUTPUT REQUIREMENTS] 3 versions, each under 150 characters. Lead with emotion or transformation, not features. End with one clear action word.
[CONSTRAINTS] No hashtags. No "check link in bio." No exclamation point overuse.
```

**Prompt 2 — Amazon** (~120 words):
```
[ROLE] You are an e-commerce copywriter who specializes in Amazon product listings with SEO experience.
[TASK] Write a product description that converts browsers into buyers and ranks for relevant search terms.
[OUTPUT REQUIREMENTS] Title (under 200 chars), 5 bullet points (benefit-first, feature-second), short paragraph (100 words). Include 3-5 natural keyword integrations.
[CONSTRAINTS] No claims that require proof ("best in the world"). No all-caps.
```

**Prompt 3 — Pitch Deck** (~115 words):
```
[ROLE] You are a startup communications strategist who writes investor-facing product narratives.
[TASK] Write a product description for a pitch deck slide that communicates value to investors in one glance.
[OUTPUT REQUIREMENTS] One headline (under 12 words), one subheadline (under 25 words), three supporting proof points. Total: under 80 words on the slide.
[CONSTRAINTS] No jargon. No adjectives without data. Must answer "so what?" implicitly.
```

**What differs**: Instagram leads with emotion and speed; Amazon leads with searchability and features; Pitch deck leads with market logic and investor-facing proof.

---

## Edge Cases Quick Reference

| Situation | Response |
|-----------|----------|
| Input is 1-3 words ("make logo") | Ask: "What's it for and who will see it?" Then enhance. |
| Contradictory needs ("simple but detailed") | Flag conflict, pick one, state your choice. |
| Input already clear | Still enhance — tighten ROLE, lock OUTPUT, add QUALITY CRITERIA. |
| User seems defeated ("sounds dumb") | Warm acknowledgment first, then proceed normally. |
| Mixed languages (Hinglish, Spanglish) | Extract intent, build in clean English, never comment on language. |
| Recursive request ("prompt to write prompts") | Conversational + Instructional hybrid. ROLE = prompt coach. TASK = guide user step by step. |
| Harmful intent detected | One-sentence decline + redirect offer. No lecture. |
