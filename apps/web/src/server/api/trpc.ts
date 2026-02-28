import { initTRPC, TRPCError } from '@trpc/server';

import { logger } from '@/lib/logger';
import {
  AlreadyExistsError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@/server/domain/error/domain-errors';
import { dateTransformer } from '@/trpc/transformer';

export type Context = {
  isAuthenticated: boolean;
};

const t = initTRPC.context<Context>().create({
  transformer: dateTransformer,
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

// NOTE: ドメインエラーを適切な TRPCError コードに変換する middleware である
// NOTE: next() はエラーを throw せず { ok: false, error } を返すため、結果を検査して再 throw する
const domainErrorMiddleware = t.middleware(async ({ next }) => {
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
});

export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.isAuthenticated) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: '認証が必要です',
      });
    }
    return next();
  })
  .use(domainErrorMiddleware);

// NOTE: DomainError のサブクラスに応じた TRPCError を throw する。該当しない場合は何もしない
const throwDomainTRPCError = (cause: unknown): void => {
  if (cause instanceof UnauthorizedError) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: cause.message,
      cause,
    });
  }
  if (cause instanceof ForbiddenError) {
    throw new TRPCError({
      code: 'FORBIDDEN',
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
