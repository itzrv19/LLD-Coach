import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EvaluationStatusWrapper from './EvaluationStatusWrapper';
import Link from 'next/link';
import { createAttemptAction } from '@/app/actions';

export default async function EvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      problem: true,
      submissions: {
        include: {
          evaluation: {
            include: {
              criteria: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  });

  if (!attempt) {
    notFound();
  }

  const submission = attempt.submissions[0];
  const evaluation = submission?.evaluation;
  
  const tryAgainAction = createAttemptAction.bind(null, attempt.problemId);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/problem/${attempt.problemId}`} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Back to Problem
        </Link>
        {attempt.status === 'COMPLETED' && (
          <form action={tryAgainAction}>
            <button type="submit" className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border-0">
              Try Again
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-slate-50">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Evaluation Feedback</h1>
          <p className="text-slate-600">Problem: {attempt.problem.title}</p>
        </div>

        <EvaluationStatusWrapper attemptId={attempt.id} status={attempt.status} />

        {attempt.status === 'COMPLETED' && evaluation && (
          <div className="p-8 space-y-10">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Overall Summary</h2>
              <div className="bg-blue-50 text-blue-900 p-6 rounded-xl border border-blue-100 text-lg leading-relaxed">
                {evaluation.overallSummary}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Strengths
                </h2>
                <ul className="space-y-3">
                  {JSON.parse(evaluation.strengths).map((strength: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-green-50/50 p-4 rounded-xl border border-green-100">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span className="text-slate-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Priority Improvements
                </h2>
                <ul className="space-y-3">
                  {JSON.parse(evaluation.priorityImprovements).map((improvement: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                      <span className="text-amber-600 mt-0.5">•</span>
                      <span className="text-slate-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-6">Detailed Rubric Evaluation</h2>
              <div className="space-y-6">
                {evaluation.criteria.map((criterion) => (
                  <div key={criterion.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">{criterion.criterion}</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                          criterion.confidence === 'HIGH' ? 'bg-slate-200 text-slate-700' :
                          criterion.confidence === 'MEDIUM' ? 'bg-slate-200 text-slate-600' :
                          'bg-slate-200 text-slate-500'
                        }`}>
                          {criterion.confidence} CONFIDENCE
                        </span>
                        <div className={`px-3 py-1 rounded-full font-bold text-sm ${
                          criterion.score >= 8 ? 'bg-green-100 text-green-700' :
                          criterion.score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {criterion.score}/10
                        </div>
                      </div>
                    </div>
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="col-span-1 space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evidence</h4>
                        <p className="text-sm text-slate-700 italic border-l-2 border-slate-300 pl-3 py-1">"{criterion.evidence}"</p>
                      </div>
                      <div className="col-span-1 space-y-2">
                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">Concern</h4>
                        <p className="text-sm text-slate-700">{criterion.concern}</p>
                      </div>
                      <div className="col-span-1 space-y-2">
                        <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider">Suggestion</h4>
                        <p className="text-sm text-slate-700">{criterion.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {attempt.status === 'FAILED' && (
          <div className="p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Evaluation Failed</h2>
            <p className="text-slate-600 mb-6">{evaluation?.failureReason || 'An unexpected error occurred during evaluation.'}</p>
            <p className="text-sm text-slate-500 mb-6">Don't worry, your submission was saved.</p>
            <Link href={`/attempt/${attempt.id}`} className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors">
              Return to Submission
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
