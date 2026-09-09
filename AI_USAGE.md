# AI Usage Report

This document outlines meaningful engineering decisions where AI assistance was utilized during the development of LLD Coach.

### 1. Evaluator Abstraction Design
**Problem given to AI:** "I need an abstraction to support both an AI-based evaluator and a deterministic fallback evaluator for LLD submissions. How should I structure the interfaces and the factory?"
**What AI suggested:** The AI suggested creating a base `AbstractEvaluator` class that implements shared logic (like string sanitization) and two subclasses (`AIEvaluator` and `RuleBasedEvaluator`). It also suggested passing the entire `Submission` Prisma model into the `evaluate` method.
**What was accepted/rejected:** I rejected passing the Prisma model directly into the evaluator. I accepted the interface approach but simplified it to a pure TypeScript interface `Evaluator` rather than an abstract class to avoid unnecessary inheritance. 
**Final Engineering Decision:** Created `EvaluationInput` and `EvaluationOutput` types to decouple the evaluator from Prisma models entirely. Implemented a simple `getEvaluator()` factory based on environment variables.

### 2. State Machine for Attempts
**Problem given to AI:** "How do I prevent duplicate evaluation processing if a user spam-clicks the submit button on an attempt?"
**What AI suggested:** The AI suggested implementing a distributed lock using Redis, or adding an `isEvaluating` boolean to the `Submission` table and wrapping the submission in a Prisma interactive transaction.
**What was accepted/rejected:** I rejected the Redis distributed lock as it violated the constraint of keeping the MVP simple and not over-engineering. I also rejected adding an `isEvaluating` boolean because it mixes transient state with persistent data.
**Final Engineering Decision:** I explicitly modeled the state machine using a `status` string field on the `Attempt` aggregate root (`DRAFT`, `SUBMITTED`, `EVALUATING`, `COMPLETED`, `FAILED`). Duplicate submissions are rejected at the service boundary if the state is not `DRAFT`.

### 3. Asynchronous Evaluation Execution
**Problem given to AI:** "Calling the OpenAI API takes 10-20 seconds. Next.js Server Actions timeout or block the client if I await it. How should I handle this without setting up a message queue worker?"
**What AI suggested:** The AI suggested using `Promise.allSettled` or dispatching an API route using `fetch` with a short timeout to trigger a background thread.
**What was accepted/rejected:** I rejected the `fetch` hack as it is unreliable and an anti-pattern in Next.js App Router. 
**Final Engineering Decision:** I implemented `evaluateSubmissionAsync(submission.id).catch(...)` as a floating Promise in the Server Action. While not perfectly durable against server crashes, it safely offloads the long-running task to the Node.js event loop without blocking the client. The client polls the status using a `useEffect` and `router.refresh()`.

### 4. Rule-Based Evaluator Heuristics
**Problem given to AI:** "I need the RuleBasedEvaluator to return realistic-looking JSON matching the AI output, but without actually using an LLM. It should be deterministic."
**What AI suggested:** The AI generated a complex regex-based parser to look for keywords like "Singleton", "Factory", "extends", and "implements" in the user's text.
**What was accepted/rejected:** I rejected the regex keyword parser. LLD is subjective, and looking for "Singleton" would arbitrarily reward bad design just because a keyword was present.
**Final Engineering Decision:** I implemented a simpler length-based heuristic function that verifies whether the user put sufficient effort into each section. If a section is left empty, it scores a 1 and provides a concern of "Missing critical information". This is honest, deterministic, and doesn't pretend to understand semantics it can't.
