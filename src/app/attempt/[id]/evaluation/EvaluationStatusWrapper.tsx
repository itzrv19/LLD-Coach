'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EvaluationStatusWrapper({ attemptId, status }: { attemptId: string, status: string }) {
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'EVALUATING') {
      interval = setInterval(() => {
        router.refresh();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, router]);

  if (status !== 'EVALUATING' && status !== 'SUBMITTED') {
    return null;
  }

  return (
    <div className="p-16 flex flex-col items-center justify-center border-b border-gray-100">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-blue-600 text-xs font-bold font-mono">AI</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your design...</h2>
      <p className="text-slate-500 max-w-md text-center">
        We are reviewing your architecture, class responsibilities, and trade-offs. This usually takes about 10-20 seconds.
      </p>
    </div>
  );
}
