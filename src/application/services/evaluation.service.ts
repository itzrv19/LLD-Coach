import { prisma } from '@/lib/prisma';
import { getEvaluator } from '@/infrastructure/evaluators';
import { EvaluationInput } from '@/domain/evaluation/types';
import { DEFAULT_RUBRIC } from '@/domain/evaluation/rubric';

export async function evaluateSubmissionAsync(submissionId: string) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { attempt: { include: { problem: true } } }
    });

    if (!submission) {
      console.error(`Evaluation failed: Submission ${submissionId} not found`);
      return;
    }

    const problem = submission.attempt.problem;

    const input: EvaluationInput = {
      problemRequirements: `${problem.detailedStatement}\n\nFunctional Requirements:\n${problem.functionalReqs}\n\nConstraints:\n${problem.constraints}`,
      candidateRequirementsUnderstanding: submission.requirementsUnderstanding,
      candidateAssumptions: submission.assumptions,
      candidateClassesAndResponsibilities: submission.classesAndResponsibilities,
      candidateRelationships: submission.relationships,
      candidateDesignExplanation: submission.designExplanation,
      candidateEdgeCases: submission.edgeCases,
      candidateTradeOffs: submission.tradeOffs,
      rubricCriteria: DEFAULT_RUBRIC,
    };

    const evaluator = getEvaluator();
    
    // Determine type for storage
    const evaluatorType = process.env.EVALUATOR_TYPE === 'AI' && process.env.OPENAI_API_KEY ? 'AI' : 'RULE_BASED';

    const output = await evaluator.evaluate(input);

    await prisma.$transaction(async (tx) => {
      // Save evaluation
      const evaluation = await tx.evaluation.create({
        data: {
          submissionId,
          evaluatorType,
          overallSummary: output.overallSummary,
          strengths: JSON.stringify(output.strengths),
          priorityImprovements: JSON.stringify(output.priorityImprovements),
          status: 'COMPLETED',
          criteria: {
            create: output.criteria.map(c => ({
              criterion: c.criterion,
              score: c.score,
              evidence: c.evidence,
              concern: c.concern,
              suggestion: c.suggestion,
              confidence: c.confidence
            }))
          }
        }
      });

      // Mark attempt as completed
      await tx.attempt.update({
        where: { id: submission.attemptId },
        data: { status: 'COMPLETED' }
      });
    });

  } catch (error: any) {
    console.error(`Evaluation failed for submission ${submissionId}:`, error);
    
    // Mark as failed but preserve submission
    const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (submission) {
      await prisma.$transaction(async (tx) => {
        await tx.evaluation.upsert({
          where: { submissionId },
          create: {
            submissionId,
            evaluatorType: 'UNKNOWN',
            overallSummary: '',
            strengths: '[]',
            priorityImprovements: '[]',
            status: 'FAILED',
            failureReason: error.message || 'Unknown error occurred during evaluation.'
          },
          update: {
            status: 'FAILED',
            failureReason: error.message || 'Unknown error occurred during evaluation.'
          }
        });

        await tx.attempt.update({
          where: { id: submission.attemptId },
          data: { status: 'FAILED' }
        });
      });
    }
  }
}
