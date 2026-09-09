export interface EvaluationInput {
  problemRequirements: string;
  candidateRequirementsUnderstanding: string;
  candidateAssumptions: string;
  candidateClassesAndResponsibilities: string;
  candidateRelationships: string;
  candidateDesignExplanation: string;
  candidateEdgeCases: string;
  candidateTradeOffs: string | null;
  rubricCriteria: string[];
}

export interface EvaluationCriterionResult {
  criterion: string;
  score: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EvaluationOutput {
  overallSummary: string;
  strengths: string[];
  priorityImprovements: string[];
  criteria: EvaluationCriterionResult[];
}
