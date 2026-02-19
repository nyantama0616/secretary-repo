import * as v from 'valibot';

import { publicProcedure, router } from '@/server/api/trpc';
import {
  createUserUseCase,
  getUserUseCase,
  getUsersUseCase,
} from '@/server/infrastructure/di/container';
import { CreateUserInputSchema } from '@/server/usecase/user/create-user';
import { GetUserInputSchema } from '@/server/usecase/user/get-user';

export const userRouter = router({
  list: publicProcedure.query(() => getUsersUseCase.execute()),
  detail: publicProcedure
    .input(v.parser(GetUserInputSchema))
    .query(({ input }) => getUserUseCase.execute(input)),
  create: publicProcedure
    .input(v.parser(CreateUserInputSchema))
    .mutation(({ input }) => createUserUseCase.execute(input)),
});
