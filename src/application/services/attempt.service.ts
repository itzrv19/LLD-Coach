import { prisma } from '@/lib/prisma';
import { evaluateSubmissionAsync } from './evaluation.service';

export async function startAttempt(problemId: string) {
  // Check if problem exists
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) throw new Error('Problem not found');

  const attempt = await prisma.attempt.create({
    data: {
      problemId,
      status: 'DRAFT',
    }
  });

  return attempt;
}

export type SaveDraftInput = {
  attemptId: string;
  submissionId?: string; // If updating an existing draft
  requirementsUnderstanding: string;
  assumptions: string;
  classesAndResponsibilities: string;
  relationships: string;
  designExplanation: string;
  edgeCases: string;
  tradeOffs?: string;
};

export async function saveDraft(input: SaveDraftInput) {
  const attempt = await prisma.attempt.findUnique({ where: { id: input.attemptId } });
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.status !== 'DRAFT') throw new Error('Cannot save draft for an attempt that is not in DRAFT state');

  let submission;
  if (input.submissionId) {
    submission = await prisma.submission.update({
      where: { id: input.submissionId },
      data: {
        requirementsUnderstanding: input.requirementsUnderstanding,
        assumptions: input.assumptions,
        classesAndResponsibilities: input.classesAndResponsibilities,
        relationships: input.relationships,
        designExplanation: input.designExplanation,
        edgeCases: input.edgeCases,
        tradeOffs: input.tradeOffs || null,
      }
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        attemptId: input.attemptId,
        requirementsUnderstanding: input.requirementsUnderstanding,
        assumptions: input.assumptions,
        classesAndResponsibilities: input.classesAndResponsibilities,
        relationships: input.relationships,
        designExplanation: input.designExplanation,
        edgeCases: input.edgeCases,
        tradeOffs: input.tradeOffs || null,
      }
    });
  }

  return submission;
}

export async function submitAttempt(input: SaveDraftInput) {
  // First save as draft
  const submission = await saveDraft(input);

  // Mark attempt as submitted
  const attempt = await prisma.attempt.update({
    where: { id: input.attemptId },
    data: { status: 'SUBMITTED' }
  });

  // Trigger evaluation asynchronously to not block the request
  // (In a real system this would be a message queue, but for MVP we will just call it without awaiting it, 
  // or await it if we want to hold the connection. But Next.js Server Actions allow async background tasks if we're careful.
  // Actually, we should change state to EVALUATING and then do it)
  
  await prisma.attempt.update({
    where: { id: input.attemptId },
    data: { status: 'EVALUATING' }
  });

  // Start background evaluation
  evaluateSubmissionAsync(submission.id).catch(console.error);

  return { attempt, submission };
}
