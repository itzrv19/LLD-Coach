import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Prevent static generation to show latest attempts

export default async function DashboardPage() {
  const problems = await prisma.problem.findMany({
    include: {
      attempts: {
        orderBy: { updatedAt: 'desc' }
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Practice Low-Level Design</h1>
          <p className="text-slate-600 max-w-2xl">
            Select an LLD problem, write a structured design, submit it, and receive automated rubric-based feedback to improve your architectural skills.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6">Available Problems</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {problems.map((problem) => {
            const attemptCount = problem.attempts.length;
            const latestAttempt = problem.attempts[0];

            return (
              <div key={problem.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {problem.title}
                    </h3>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      problem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                      problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                    {problem.shortDescription}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                      {attemptCount} {attemptCount === 1 ? 'Attempt' : 'Attempts'}
                    </div>
                    {latestAttempt && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        <span className={`font-medium ${
                          latestAttempt.status === 'COMPLETED' ? 'text-green-600' : 
                          latestAttempt.status === 'EVALUATING' ? 'text-blue-600' : 
                          'text-amber-600'
                        }`}>
                          Latest: {latestAttempt.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  {latestAttempt ? (
                    <Link href={`/problem/${problem.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      Continue practicing &rarr;
                    </Link>
                  ) : (
                    <Link href={`/problem/${problem.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                      Start first attempt &rarr;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
