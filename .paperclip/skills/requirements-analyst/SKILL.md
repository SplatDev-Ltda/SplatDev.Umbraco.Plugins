---
name: requirements-analyst
description: Requirements Analyst discipline for Paperclip RA agents. Covers project story completeness scoring, questionnaire generation, per-issue ambiguity detection, clarification workflow, acceptance criteria standards, and post-approval issue creation from an approved plan.
---

# Requirements Analyst Skill

Read this skill when starting a new project intake, receiving a project story, triaging a new issue, or when an issue is flagged as ambiguous or unclear.

---

## 1. Project Story Completeness Assessment

Before requesting a plan or accepting a project, score the project story on these axes (internal — do not share the score):

| Signal | Points |
|--------|--------|
| Clear problem statement ("we need X because Y") | +2 |
| Defined end state ("done when...") | +2 |
| Named user roles ("as a [role]...") | +1 |
| Tech stack specified or inferable | +1 |
| Timeline or deadline stated | +1 |
| Integration requirements named (3rd-party APIs, auth, payments) | +1 |
| Business logic constraints stated | +1 |
| **Total possible** | **9** |

**Threshold:**
- Score ≥ 7: story is complete — proceed to plan generation (hand off to PM/project-planning skill).
- Score 4–6: generate partial plan; note all assumptions; questionnaire optional (use judgment).
- Score < 4: generate questionnaire first; do not start plan until answered.

---

## 2. Questionnaire Generation

Generate a questionnaire when:
- Project story scores < 4 (project level)
- Any new issue is flagged as ambiguous (per-issue level — see §3)

**Question categories (choose the most relevant 3–6 per project):**

1. **Happy paths** — What are the primary user flows? Walk through step-by-step for each user role.
2. **Unhappy paths** — What should happen when [likely failure scenario]? (Validation errors, permission denied, external service down, etc.)
3. **Variations** — Are there different behaviors for different user roles, plan tiers, or device types?
4. **Business logic** — Are there pricing rules, eligibility rules, or approval chains to model?
5. **Workflow logic** — Are there notifications, deadlines, state transitions, or audit trails required?
6. **Integrations** — Which 3rd-party APIs, auth providers, or payment processors does this touch?

**Delivery:**
- **Issue questionnaire**: post all questions in a single numbered comment on the issue. Add label `needs-clarification`. Issue stays in `todo` and may not be checked out until the label is removed.
- **Project questionnaire via Team Chat**: one question at a time; wait for the answer before posting the next.
- **Project questionnaire via email**: all questions in one HTML-formatted email (when company email notifications are configured).

---

## 3. Per-Issue Ambiguity Detection

When any issue is created or triaged, evaluate it. Flag as ambiguous if ANY of these are true:

| Signal | Example |
|--------|---------|
| Description < 100 characters | "Fix the login bug" |
| No acceptance criteria | No "- [ ]" checklist or "## Acceptance" section |
| Hedging language | "maybe", "something like", "not sure", "TBD", "figure out", "look into", "explore" |
| No clear deliverable | No "done when", "the result should be", "output is" |
| Undefined reference | "the usual way", "as discussed", "like before", "same as X" |

**Per-issue clarification workflow:**

```
1. Post questionnaire comment (scoped to that issue — not the full project questionnaire).
2. Add label `needs-clarification`.
3. Post: "⚠️ This issue needs clarification before work can begin. See questions above."
4. Set issue status: remains in `todo` — block checkout via label check.
5. Operator or creator replies with answers.
6. RA processes answers:
   a. Updates issue description with the clarified spec (acceptance criteria, deliverable, constraints).
   b. Removes `needs-clarification` label.
7. Issue is now available for checkout.
```

**Bypass:** If the operator adds label `clarified` or posts a comment containing "skip-questionnaire", acknowledge and allow checkout without questionnaire. Do not add `needs-clarification` again.

---

## 4. Acceptance Criteria Standards

Every issue you touch or create must have acceptance criteria before it leaves your hands.

**Required format:**
```markdown
## Acceptance Criteria
- [ ] [observable, testable criterion — what a QA agent can verify]
- [ ] [criterion 2]
- [ ] [criterion 3]
```

**Criteria quality rules:**
- Each criterion must be independently verifiable (automated test or screenshot).
- Use "should" not "might" or "could".
- Include at least one negative criterion ("should NOT allow X when Y").
- If the feature touches the UI: at least one criterion names the exact UI element ("the Save button is disabled until all required fields are filled").
- If the feature touches the API: at least one criterion names the exact endpoint and response ("POST /api/... returns 201 with `{ id: "..." }`").

---

## 5. Post-Approval Issue Creation

After a plan is approved by stakeholders (see `project-planning` skill §7), create issues spec-first. No code discussion in the issue — requirements only.

**Issue template:**
```
Title: [Feature] [feature name from implementation plan]
issueType: story
priority: [inferred from implementation order and dependencies]
description: |
  ## Context
  [Why this feature is needed — link to the plan document]

  ## Acceptance Criteria
  - [ ] [criterion 1]
  - [ ] [criterion 2]
  - [ ] [criterion 3]

  ## Technical Notes
  [Any technical constraints from the plan — no implementation instructions]

  ## Dependencies
  - Blocked by: #[issue ID]
parentId: [epic ID if applicable]
sprintId: [sprint ID]
```

**Batch rule:** Create all issues in one batch before assigning to agents. Set dependency links (`blocks`/`blocked_by`) between issues before sprint assignment. Do not start assigning until all issues are created and linked.

---

## 6. Escalation Triggers

Escalate to the PM / Scrum Master (not directly to the operator) when:

- Operator does not answer a questionnaire within **24 hours** → post a follow-up comment; if no response in another 24 hours → escalate to PM with a summary.
- A stakeholder requests a scope change that affects > 3 already-created issues → flag to PM before updating issues; PM decides whether to open a change request issue.
- Two or more issues share overlapping acceptance criteria that look like duplication → flag to PM; do not merge or delete issues yourself.

Format:
```
**RA Escalation — action needed from PM**

Issue(s): #[ID list]
Reason: [specific — "questionnaire unanswered for 48h", "scope change affects sprint", "suspected duplicate criteria"]
Proposed resolution: [what you recommend PM does]
```
