import { Evaluator } from '@/domain/evaluation/evaluator';
import { EvaluationInput, EvaluationOutput, EvaluationCriterionResult } from '@/domain/evaluation/types';

export class RuleBasedEvaluator implements Evaluator {
  async evaluate(input: EvaluationInput): Promise<EvaluationOutput> {
    // Simulate some delay to show the evaluating state in UI
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const criteriaResults: EvaluationCriterionResult[] = [];
    let totalScore = 0;

    const checkLength = (text: string | null | undefined, minLength: number) => {
      const len = text?.trim().length || 0;
      if (len === 0) return { score: 1, evidence: 'Section was left empty.', concern: 'Missing critical information.', suggestion: 'Ensure you fill out all sections.' };
      if (len < minLength) return { score: 4, evidence: `Provided text is too short (${len} chars).`, concern: 'Insufficient detail provided.', suggestion: 'Expand on your thoughts and provide more specifics.' };
      return { score: 8, evidence: `Adequate detail provided (${len} chars).`, concern: 'None', suggestion: 'Consider organizing with bullet points or clearer structures.' };
    };

    for (const criterion of input.rubricCriteria) {
      let result = { score: 5, evidence: '', concern: '', suggestion: '' };
      
      switch (criterion) {
        case 'Requirement Understanding':
          result = checkLength(input.candidateRequirementsUnderstanding, 50);
          break;
        case 'Class Responsibilities':
          result = checkLength(input.candidateClassesAndResponsibilities, 100);
          break;
        case 'Coupling & Cohesion':
        case 'Encapsulation & Interfaces':
        case 'Abstraction / Patterns':
          result = checkLength(input.candidateDesignExplanation, 150);
          break;
        case 'Extensibility':
          result = checkLength(input.candidateTradeOffs, 50);
          break;
        case 'Edge Cases & Testability':
          result = checkLength(input.candidateEdgeCases, 50);
          break;
        case 'Quality of Explanation':
          result = checkLength(input.candidateDesignExplanation, 100);
          break;
        default:
          result = { score: 5, evidence: 'Fallback rule.', concern: 'Unknown criterion.', suggestion: 'N/A' };
      }

      totalScore += result.score;
      criteriaResults.push({
        criterion,
        score: result.score,
        evidence: result.evidence,
        concern: result.concern,
        suggestion: result.suggestion,
        confidence: 'HIGH'
      });
    }

    const avgScore = totalScore / input.rubricCriteria.length;
    const strengths = avgScore > 5 ? ['Provided sufficient detail in multiple sections.'] : [];
    const priorityImprovements = avgScore <= 5 ? ['Expand on your reasoning.', 'Ensure all sections are completely filled out.'] : ['Add deeper technical reasoning to trade-offs.'];

    return {
      overallSummary: `Rule-based evaluation completed. Average detail score: ${avgScore.toFixed(1)}/10. Note: This is a deterministic evaluation based on text heuristics, not deep semantic understanding.`,
      strengths,
      priorityImprovements,
      criteria: criteriaResults,
    };
  }
}
