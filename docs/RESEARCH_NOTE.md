# Research Note: LLD Practice Platform

## Context and Goal
The goal of this research is to investigate how software engineering learners currently practice Low-Level Design (LLD) interviews, how feedback is provided, and identify product opportunities to build a better practice platform.

## Research Findings
We investigated a sample of existing platforms and community discussions (e.g., LeetCode discussion forums, Pramp, Educative.io, and general GitHub repositories containing LLD solutions).

### 1. How learners currently practice LLD
- **Unstructured Canvas:** Learners often use unstructured tools (Notepad, Google Docs, draw.io, or physical whiteboards) to practice.
- **Static Courses:** Platforms like Educative.io offer text-heavy courses where learners read about an LLD problem (like Parking Lot) and then view a single "reference" solution.
- **Mock Interviews:** Platforms like Pramp facilitate peer-to-peer interviews where two learners evaluate each other.

### 2. How submissions are represented
- **Code:** Many platforms require the learner to write compilable code (e.g., Java/C++) to represent their classes.
- **UML Diagrams:** Some learners use PlantUML or draw.io to create class diagrams.
- **Text Descriptions:** In forums (like LeetCode Discuss), learners post textual descriptions of their entities and relationships.

### 3. How feedback is provided
- **Binary/Self-Evaluation:** On static platforms, feedback is binary—you either matched the reference solution or you didn't. The learner must self-evaluate by comparing their design to the author's code.
- **Peer Feedback:** In mock interviews, feedback is subjective and highly dependent on the peer's own experience level, which is often low.
- **Community Comments:** On forums, feedback is sporadic, unstructured, and often focuses on minutiae rather than systemic design quality.

### 4. How learners retry
- Retrying is largely manual. Learners must start a new document or erase their whiteboard. There is rarely a concept of "Attempt 1 vs Attempt 2" tracking in existing platforms.

## Interpretation & Identified Gaps
1. **The "Reference Solution" Trap:** Existing tools treat LLD like LeetCode algorithms—implying there is only one correct answer. This is fundamentally wrong for system design and LLD, where multiple valid architectures exist based on trade-offs.
2. **High Barrier to Entry for Tooling:** Forcing a learner to draw a UML diagram or write 500 lines of boilerplate Java code slows down the core learning loop, which is about *architectural thinking*, not syntax.
3. **Lack of Iteration:** Because feedback is slow or binary, learners rarely iterate on a single problem. They look at the answer and move on, rather than refining their design.
4. **Unexplainable Feedback:** When a learner gets feedback, they rarely understand *why* a particular design choice was poor.

## Product Decision for LLD Coach
Based on these findings, we made the following decisions for the MVP:

1. **Structured Text over Code/UML:** We will use a structured text submission format (Requirements, Classes, Relationships, Trade-offs). This lowers the friction to submit a design and focuses the learner on pure architectural reasoning rather than wrestling with a UML editor or compiler.
2. **Rubric-Based Evaluation:** We will use a strict, evidence-based rubric (e.g., Coupling, Encapsulation, Edge Cases) rather than comparing the submission to a single reference solution. This allows for multiple valid designs.
3. **Explainable AI Feedback:** We will use a structured AI evaluator to provide detailed explanations for *why* a score was given (Evidence -> Concern -> Suggestion). This bridges the gap between binary self-evaluation and expensive expert coaching.
4. **First-Class Iteration (Attempts):** The data model will explicitly support `Problem -> multiple Attempts`. The UI will encourage learners to review their feedback and click "Try Again" to see their progression.
