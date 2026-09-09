import { describe, it, expect } from 'vitest';
import { RuleBasedEvaluator } from './rule-based-evaluator';
import { EvaluationInput } from '@/domain/evaluation/types';
import { DEFAULT_RUBRIC } from '@/domain/evaluation/rubric';

describe('RuleBasedEvaluator', () => {
  it('should penalize empty fields', async () => {
    const evaluator = new RuleBasedEvaluator();
    
    const input: EvaluationInput = {
      problemRequirements: 'Design something',
      candidateRequirementsUnderstanding: '',
      candidateAssumptions: '',
      candidateClassesAndResponsibilities: '',
      candidateRelationships: '',
      candidateDesignExplanation: '',
      candidateEdgeCases: '',
      candidateTradeOffs: '',
      rubricCriteria: DEFAULT_RUBRIC,
    };

    const result = await evaluator.evaluate(input);

    expect(result.criteria.every(c => c.score <= 5)).toBe(true);
    expect(result.priorityImprovements.length).toBeGreaterThan(0);
  });

  it('should reward detailed fields', async () => {
    const evaluator = new RuleBasedEvaluator();
    
    const input: EvaluationInput = {
      problemRequirements: 'Design something',
      candidateRequirementsUnderstanding: 'a'.repeat(60),
      candidateAssumptions: 'a'.repeat(60),
      candidateClassesAndResponsibilities: 'a'.repeat(120),
      candidateRelationships: 'a'.repeat(60),
      candidateDesignExplanation: 'a'.repeat(160),
      candidateEdgeCases: 'a'.repeat(60),
      candidateTradeOffs: 'a'.repeat(60),
      rubricCriteria: DEFAULT_RUBRIC,
    };

    const result = await evaluator.evaluate(input);

    expect(result.criteria.some(c => c.score > 5)).toBe(true);
    expect(result.strengths.length).toBeGreaterThan(0);
  });
});
