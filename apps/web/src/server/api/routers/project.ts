import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  getProjectUseCase,
  getProjectsUseCase,
} from '@/server/infrastructure/di/container';
import { GetProjectInputSchema } from '@/server/usecase/project/get-project';

export const projectRouter = router({
  list: protectedProcedure.query(() => getProjectsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetProjectInputSchema))
    .query(({ input }) => getProjectUseCase.execute(input)),
});
