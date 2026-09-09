import { Evaluator } from '@/domain/evaluation/evaluator';
import { RuleBasedEvaluator } from './rule-based-evaluator';
import { AIEvaluator } from './ai-evaluator';

export function getEvaluator(): Evaluator {
  const type = process.env.EVALUATOR_TYPE;
  
  if (type === 'AI' && process.env.OPENAI_API_KEY) {
    return new AIEvaluator();
  }
  
  // Fallback to RuleBasedEvaluator
  return new RuleBasedEvaluator();
}
