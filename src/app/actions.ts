'use server';

import { startAttempt, saveDraft, submitAttempt, SaveDraftInput } from '@/application/services/attempt.service';
import { redirect } from 'next/navigation';

export async function createAttemptAction(problemId: string) {
  const attempt = await startAttempt(problemId);
  redirect(`/attempt/${attempt.id}`);
}

export async function saveDraftAction(input: SaveDraftInput) {
  await saveDraft(input);
  return { success: true };
}

export async function submitAttemptAction(input: SaveDraftInput) {
  await submitAttempt(input);
  redirect(`/attempt/${input.attemptId}/evaluation`);
}
