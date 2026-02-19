import { TRPCError } from '@trpc/server';
import { notFound } from 'next/navigation';

export const ensureFound = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      notFound();
    }
    throw error;
  }
};
