import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { createAttemptAction } from '@/app/actions';

export default async function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      attempts: {
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  if (!problem) {
    notFound();
  }

  const hasAttempts = problem.attempts.length > 0;
  const startAttemptAction = createAttemptAction.bind(null, problem.id);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-slate-900">{problem.title}</h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                problem.difficulty === 'EASY' ? 'bg-green-50 text-green-700 border-green-200' :
                problem.difficulty === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <p className="text-lg text-slate-600">{problem.shortDescription}</p>
          </div>
          <div className="flex-shrink-0">
            <form action={startAttemptAction}>
              <button 
                type="submit"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {hasAttempts ? 'Start New Attempt' : 'Start Attempt'}
              </button>
            </form>
          </div>
        </div>

        <div className="p-8 space-y-10">
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
              Problem Statement
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700">
              <p className="whitespace-pre-wrap leading-relaxed">{problem.detailedStatement}</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full inline-block"></span>
              Functional Requirements
            </h2>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
              <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
                {problem.functionalReqs}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full inline-block"></span>
              Constraints
            </h2>
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-amber-900">
                {problem.constraints}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
              What you should think about
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700">
              <p className="whitespace-pre-wrap leading-relaxed italic">{problem.suggestedThinking}</p>
            </div>
          </section>
        </div>
      </div>
      
      {hasAttempts && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Previous Attempts</h3>
          <div className="space-y-3">
            {problem.attempts.map((attempt, index) => (
              <div key={attempt.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Attempt {problem.attempts.length - index}</span>
                  <span className="text-slate-500 text-sm ml-3">{new Date(attempt.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${
                    attempt.status === 'COMPLETED' ? 'text-green-600' :
                    attempt.status === 'FAILED' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {attempt.status}
                  </span>
                  <Link href={`/attempt/${attempt.id}`} className="text-blue-600 text-sm font-medium hover:underline">
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
