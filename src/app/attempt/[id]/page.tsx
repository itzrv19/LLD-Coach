import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import WorkspaceClient from './WorkspaceClient';

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      problem: true,
      submissions: {
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  });

  if (!attempt) {
    notFound();
  }

  // If already submitted/evaluating, redirect to evaluation page
  if (attempt.status !== 'DRAFT') {
    redirect(`/attempt/${attempt.id}/evaluation`);
  }

  const existingSubmission = attempt.submissions[0] || null;

  return (
    <div className="max-w-full h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <WorkspaceClient 
        attempt={attempt} 
        problem={attempt.problem} 
        existingSubmission={existingSubmission}
      />
    </div>
  );
}
