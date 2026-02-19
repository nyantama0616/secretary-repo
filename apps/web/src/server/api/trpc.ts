import { initTRPC, TRPCError } from '@trpc/server';

import { logger } from '@/lib/logger';
import {
  AlreadyExistsError,
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/server/domain/error/domain-errors';
import { dateTransformer } from '@/trpc/transformer';

const t = initTRPC.create({
  transformer: dateTransformer,
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

// NOTE: ドメインエラーを適切な TRPCError コードに変換することで、createCaller 経由でもエラーコードを検証できるようにする
// NOTE: next() はエラーを throw せず { ok: false, error } を返すため、結果を検査して再 throw する
export const publicProcedure = t.procedure.use(
  t.middleware(async ({ next }) => {
    const result = await next();
    if (!result.ok) {
      const cause = result.error.cause;
      if (cause instanceof DomainError) {
        throwDomainTRPCError(cause);
      } else {
        logger.error({ err: result.error }, 'Unexpected tRPC error');
      }
    }
    return result;
  }),
);

// NOTE: DomainError のサブクラスに応じた TRPCError を throw する。該当しない場合は何もしない
const throwDomainTRPCError = (cause: unknown): void => {
  if (cause instanceof UnauthorizedError) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: cause.message,
      cause,
    });
  }
  if (cause instanceof NotFoundError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: cause.message,
      cause,
    });
  }
  if (cause instanceof ValidationError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: cause.message,
      cause,
    });
  }
  if (cause instanceof AlreadyExistsError) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: cause.message,
      cause,
    });
  }
  if (cause instanceof DomainError) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: cause.message,
      cause,
    });
  }
};
