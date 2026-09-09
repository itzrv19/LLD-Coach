# Design Note: Architecture and Engineering Decisions

## Learner Problem & MVP Scope
The primary learner problem is the inability to get fast, reliable, explainable feedback on Low-Level Design (LLD) architectures. The MVP is scoped to support the complete practice loop: problem selection -> structured drafting -> submission -> evaluation -> review -> retry. It intentionally excludes complex infrastructure (microservices, Kafka) and authentication to focus on a high-quality monolithic implementation of the core domain.

## Submission Format: Why Structured Text?
We selected a structured text format (Requirements, Assumptions, Classes, Relationships, Edge Cases) for the MVP instead of a UML editor or code compiler.
- **Cognitive Load:** Text allows the learner to focus on architectural decisions rather than syntax or dragging boxes on a canvas.
- **Evaluator Feasibility:** Text is trivial to parse and analyze deterministically or via an LLM, reducing the risk of parsing errors from a custom JSON/UML payload.

## Core Domain Classes & Responsibilities
The domain model is built in Prisma with explicit boundaries:
- `Problem`: Holds the static definition of an LLD exercise.
- `Attempt`: Tracks a learner's lifecycle through a specific problem. It acts as the root aggregate for state transitions (DRAFT -> SUBMITTED -> EVALUATING -> COMPLETED/FAILED).
- `Submission`: Holds the actual candidate payload. It is immutable once submitted.
- `Evaluation`: Represents the feedback output. It belongs to a `Submission`.
- `EvaluationCriterionResult`: Represents a granular score and evidence for a specific rubric line item.

## Evaluator Architecture
We implemented an `Evaluator` interface to decouple the evaluation strategy from the application flow:
```typescript
interface Evaluator {
  evaluate(input: EvaluationInput): Promise<EvaluationOutput>;
}
```
This is instantiated via a factory (`getEvaluator`) based on environment configuration.

### Deterministic vs AI Checks
- **Objective Validation:** Done upstream before the evaluator is invoked. We ensure the submission has the required fields and enforce state transition constraints (e.g., cannot submit a COMPLETED attempt).
- **Subjective Reasoning:** Handled by the `Evaluator` implementation. The `AIEvaluator` uses OpenAI structured outputs (via Zod) to assess design trade-offs, coupling, and abstraction quality against a fixed rubric.

## Duplicate Handling & State Transitions
To prevent a learner from accidentally submitting multiple times and draining resources, we use explicit state tracking on the `Attempt`.
When a submission is triggered:
1. We check if the attempt is in the `DRAFT` state.
2. We synchronously transition it to `SUBMITTED`, then immediately to `EVALUATING`.
3. If a duplicate request arrives, it will fail the `DRAFT` state check and be rejected.

## Change Tests

### Change Test A: Diagram Submission
**Scenario:** Later, the platform supports a class diagram submission.
**How the domain accommodates this:** 
The domain model heavily relies on the `Submission` entity. To support diagrams, we would:
1. Add an optional `diagramUrl` or `diagramJson` field to the `Submission` model.
2. Update the `EvaluationInput` interface to include this new field.
3. Update the `Evaluator` implementations to parse the diagram data (e.g., passing the JSON to the AI or running a rule-based parser on the diagram nodes).
The core `Attempt` and `Evaluation` lifecycle remains entirely untouched. The variation belongs solely in the data extraction phase and the UI payload.

### Change Test B: Human Review
**Scenario:** Later, a human review evaluator is added.
**How the domain accommodates this:**
Because we abstracted the evaluation behind the `Evaluator` interface, the practice flow does not need to change. 
1. We would implement a `HumanEvaluator` class that implements `Evaluator`.
2. Instead of calling an API, `HumanEvaluator.evaluate()` might transition the state to `PENDING_HUMAN_REVIEW` and place the `EvaluationInput` into a human reviewer queue (e.g., a new database table).
3. The human reviewer would use a back-office UI to submit the `EvaluationOutput`.
4. A webhook or background process would then save the `Evaluation` and mark the attempt as `COMPLETED`.
The learner practice loop (Dashboard -> Attempt -> Submit -> Feedback) requires zero rewriting.

## Limitations & Scale
At a larger scale, the asynchronous `evaluateSubmissionAsync` method (which currently runs as an unawaited Promise in the Next.js Node process) would need to be replaced with a durable message queue (like AWS SQS or Redis BullMQ) to ensure evaluations are not lost if the server restarts unexpectedly.
