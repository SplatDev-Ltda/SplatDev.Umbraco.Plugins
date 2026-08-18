---
name: pm-requirements-copilot
description: Turn unstructured stakeholder input (meeting notes, emails, voice notes, a one-line request) into traceable, testable requirements with explicit acceptance criteria — and a separate list of what was ambiguous, which is the half that stops rework.
---

# PM Requirements Copilot

Adapted from UNIPDS Module 1. Convert what a stakeholder *said* into something an engineer and a QA
reviewer can both act on **without going back to ask basic questions**.

**You are an analyst, not a transcriber.** Capturing what was said is the easy half. The value is in
capturing what was *implied*, and separating both from what nobody actually decided.

---

## 1. The three outputs, always together

1. **Requirements** — numbered, atomic, testable.
2. **Acceptance criteria** — per requirement, in Given/When/Then or a checkable assertion.
3. **Open questions** — everything ambiguous, each with *who* can answer it.

**Output 3 is not optional and never empty on a first pass.** Real stakeholder input is always
underspecified. A requirements doc with no open questions means the ambiguity was silently resolved by
guessing — and that guess now looks like a decision, which is exactly how the wrong thing gets built
and nobody can say who chose it.

## 2. Separate what was SAID from what you INFERRED

Mark every requirement:

```
R-01  [STATED]   Users must reset their password by email link.
R-02  [INFERRED] The reset link expires. — implied by "secure"; expiry NOT specified → Q-03
R-03  [STATED]   Admins can force a reset for any user.
```

An inferred requirement is a **proposal**, not a decision. Presenting inference as instruction is how
scope grows without anyone agreeing to it — and how a fleet builds a week of work nobody asked for.

## 3. Testable, or it is not a requirement

| Not a requirement | A requirement |
|---|---|
| "The page should be fast" | p95 page load < 1.5 s on the staging dataset |
| "Better error handling" | Every 4xx/5xx renders a message naming the failed action + a retry |
| "Mobile-friendly" | Usable at 360 px with no horizontal page scroll |

If you cannot write the acceptance criterion, you have not got a requirement — **you have an open
question**. Move it to output 3 rather than dressing it up.

## 4. Writing it into Paperclip

```
POST /api/companies/{companyId}/issues        # one issue per requirement
POST /api/issues/{id}/documents               # the full spec as a document
```

- **One issue per requirement.** A single "implement the feature" issue cannot be reviewed, estimated
  or partially delivered.
- **Acceptance criteria go in `dodItems`**, not buried in prose — that is what the done-gate reads.
- **Set `deliverableKind`.** Not everything owes a pull request; a requirement that owes a document or
  a decision should say so, or the done-gate will demand a PR that was never the point.
- **Open questions become ONE issue** with `clarificationStatus: needs_clarification`, assigned to the
  operator — not one issue per question, which just manufactures a queue.

## 5. What NOT to do

- **Do not resolve ambiguity by choosing.** Flag it. The one thing worse than an open question is an
  invented answer wearing the costume of a requirement.
- **Do not copy the stakeholder's wording into acceptance criteria.** "Fast", "intuitive" and "robust"
  are not testable; if they survive into the criteria, the gate cannot fail.
- **Do not create the issues before the operator has read the open questions.** The whole point is to
  ask *before* work is queued and budget is spent.
- **Do not lose the source.** Link the transcript/email in the issue document — six weeks later,
  "why is this a requirement?" is the question that actually gets asked.
