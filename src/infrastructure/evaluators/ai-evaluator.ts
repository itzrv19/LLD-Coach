import { Evaluator } from '@/domain/evaluation/evaluator';
import { EvaluationInput, EvaluationOutput } from '@/domain/evaluation/types';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const evaluationSchema = z.object({
  overallSummary: z.string().describe('A high-level summary of the candidate design quality.'),
  strengths: z.array(z.string()).describe('List of 2-3 main strengths of the design.'),
  priorityImprovements: z.array(z.string()).describe('List of 2-3 highest priority areas for improvement.'),
  criteria: z.array(
    z.object({
      criterion: z.string(),
      score: z.number().min(1).max(10),
      evidence: z.string().describe('Quote or reference from the submission supporting the score.'),
      concern: z.string().describe('What is the specific issue or risk? If none, say "None".'),
      suggestion: z.string().describe('Actionable advice to improve this aspect.'),
      confidence: z.enum(['LOW', 'MEDIUM', 'HIGH'])
    })
  )
});

export class AIEvaluator implements Evaluator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy_key_to_avoid_crash'
    });
  }

  async evaluate(input: EvaluationInput): Promise<EvaluationOutput> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured for AIEvaluator.');
    }

    const systemPrompt = `
You are an expert Senior Software Engineer and Systems Architect evaluating a candidate's Low-Level Design (LLD) submission.
Your goal is to provide constructive, highly structured, and explainable feedback.

IMPORTANT PRINCIPLES:
1. There can be multiple valid LLD solutions. Do not compare only against a single reference architecture.
2. Evaluate design quality using evidence from the candidate submission.
3. Do not reward unnecessary complexity (e.g., over-engineering).
4. Do not penalize valid alternative designs simply because they differ from a reference solution.
5. Explain every meaningful concern clearly.
6. Provide actionable improvement suggestions.
7. Output exactly the structured JSON requested based on the provided rubric criteria.

RUBRIC CRITERIA:
${input.rubricCriteria.map(c => `- ${c}`).join('\n')}
`;

    const userMessage = `
PROBLEM REQUIREMENTS:
${input.problemRequirements}

CANDIDATE SUBMISSION:
Requirements Understanding:
${input.candidateRequirementsUnderstanding}

Assumptions:
${input.candidateAssumptions}

Classes & Responsibilities:
${input.candidateClassesAndResponsibilities}

Relationships:
${input.candidateRelationships}

Design Explanation:
${input.candidateDesignExplanation}

Edge Cases:
${input.candidateEdgeCases}

Trade-offs:
${input.candidateTradeOffs || 'Not provided'}

Evaluate the candidate's design according to the system instructions.
`;

    const response = await this.openai.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      response_format: zodResponseFormat(evaluationSchema, 'evaluation'),
      temperature: 0.2
    });

    const parsed = response.choices[0].message.parsed;
    if (!parsed) {
      throw new Error('Failed to parse AI evaluation output.');
    }

    return parsed as EvaluationOutput;
  }
}
