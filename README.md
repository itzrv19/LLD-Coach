# LLD Coach

LLD Coach is a platform designed to help learners practice Low-Level Design (LLD) problems. The application allows users to submit structured, text-based LLD solutions and receive explainable, rubric-based feedback. 

## Problem Being Solved
LLD problems are easy to attempt but difficult to evaluate without an experienced interviewer. A learner may create a valid-looking design but struggle to evaluate their own architectural responsibilities, abstractions, and trade-offs. LLD Coach solves this by providing automated feedback—either via a deterministically rule-based fallback or a deeper AI evaluator—helping learners review their strengths and iterate on their weaknesses.

## Features
- **Problem Selection**: Pre-seeded database with carefully crafted LLD problems (e.g., Parking Lot, Vending Machine).
- **Practice Workspace**: A structured text submission form to clearly separate requirements, classes, relationships, and trade-offs.
- **Evaluation Loop**: Submit drafts, receive rubric-based scoring, and view specific evidence and improvement suggestions.
- **Attempt History**: Review past attempts for a specific problem and see progression.
- **Dual Evaluator System**: Configuration-based toggle between a `RuleBasedEvaluator` and an `AIEvaluator`.

## Architecture
The application uses a clean, monolithic, domain-driven architecture to demonstrate proper separation of concerns (acting as an LLD example itself).

```text
+-------------------+
|     Next.js       |   <-- UI & Server Actions (Application boundary)
+---------+---------+
          |
+---------v---------+
| Application Layer |   <-- Use Cases (startAttempt, evaluateSubmissionAsync)
+---------+---------+
          |
+---------v---------+
|    Domain Layer   |   <-- Core Entities (Attempt, Submission, Evaluation)
+---------+---------+
          |
+---------v---------+
|  Infrastructure   |   <-- DB (Prisma SQLite), Evaluators (AI, RuleBased)
+-------------------+
```

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Testing**: Vitest
- **AI**: OpenAI SDK (Structured Outputs) with Zod

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` or create a `.env` file with the following:
```env
DATABASE_URL="file:./dev.db"
# Optional: Set this to use the AI Evaluator instead of the fallback RuleBasedEvaluator
# OPENAI_API_KEY="sk-..."
EVALUATOR_TYPE="AI" # Change to "RULE_BASED" to force deterministic evaluation
```

### 3. Database Setup & Seed
Initialize the SQLite database and seed the 4 initial problems:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Running Tests
Run the Vitest unit tests:
```bash
npm run test
```

## AI Evaluator vs Rule-Based Mode
- **AI Evaluator**: If `EVALUATOR_TYPE="AI"` and `OPENAI_API_KEY` is present, the app will use `gpt-4o` to deeply evaluate the semantics of your architecture.
- **Rule-Based Fallback**: If no API key is provided, the factory safely falls back to `RuleBasedEvaluator`, which provides deterministic, heuristic-based scoring (e.g., checking minimum detail depth in sections).

## Demo Flow
1. Open the **Dashboard** to see the 4 available problems.
2. Click on **Start first attempt** under "Parking Lot".
3. Read the problem context and click **Start Attempt**.
4. Fill out the structured text fields (Requirements, Classes, Trade-offs).
5. Click **Save Draft** to ensure data is persisted.
6. Click **Submit Evaluation**.
7. Wait ~10 seconds while the system transitions from `SUBMITTED` -> `EVALUATING` -> `COMPLETED`.
8. Review your **Feedback** screen (scores, strengths, weaknesses, and evidence).
9. Click **Try Again** to start a new attempt and iterate on your design.

## Architectural Decisions & Trade-offs
- **Monolithic Architecture**: Chose a clean monolith over microservices. A practice platform at this scale does not require distributed tracing, Kafka, or complex infrastructure.
- **Server Actions for Mutations**: Used Next.js Server Actions to handle state mutations (`startAttempt`, `saveDraft`) for simplicity and type safety without needing REST APIs.
- **Idempotency**: Prevent duplicate evaluation via UI disabling and state transitions (Draft -> Submitted -> Evaluating). If it fails, the status goes to Failed, preserving the submission data.
- **Asynchronous Evaluation**: The evaluation process is kicked off asynchronously after submission to prevent blocking the HTTP request for 20 seconds.

## Limitations & Future Improvements
- **No Diagram Submission**: The current model forces structured text. The domain model can easily accommodate a `DiagramSubmission` subclass, but UI components would need to be built.
- **In-Memory Job Queue**: The async evaluation uses Node's async context. In a production environment with high traffic, this should be moved to a durable queue (like BullMQ or an SQS queue) to survive server restarts during evaluation.
- **Authentication**: Authentication is excluded in this MVP for demo purposes but can easily be bolted onto the `Attempt` model (e.g., `userId`).
