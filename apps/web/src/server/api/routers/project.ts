import * as v from 'valibot';

import { protectedProcedure, router } from '@/server/api/trpc';
import {
  createProjectUseCase,
  getProjectUseCase,
  getProjectsUseCase,
} from '@/server/infrastructure/di/container';
import { CreateProjectInputSchema } from '@/server/usecase/project/create-project';
import { GetProjectInputSchema } from '@/server/usecase/project/get-project';

export const projectRouter = router({
  list: protectedProcedure.query(() => getProjectsUseCase.execute()),
  detail: protectedProcedure
    .input(v.parser(GetProjectInputSchema))
    .query(({ input }) => getProjectUseCase.execute(input)),
  create: protectedProcedure
    .input(v.parser(CreateProjectInputSchema))
    .mutation(({ input }) => createProjectUseCase.execute(input)),
});
