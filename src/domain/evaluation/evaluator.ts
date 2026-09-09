import { EvaluationInput, EvaluationOutput } from './types';

export interface Evaluator {
  evaluate(input: EvaluationInput): Promise<EvaluationOutput>;
}
