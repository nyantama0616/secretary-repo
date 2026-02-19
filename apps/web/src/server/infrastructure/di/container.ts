import { DrizzleDailyReportRepository } from '@/server/infrastructure/db/drizzle-daily-report-repository';
import { DrizzleUserRepository } from '@/server/infrastructure/db/drizzle-user-repository';
import { GetDailyReportUseCase } from '@/server/usecase/daily-report/get-daily-report';
import { GetDailyReportsUseCase } from '@/server/usecase/daily-report/get-daily-reports';
import { CreateUserUseCase } from '@/server/usecase/user/create-user';
import { GetUserUseCase } from '@/server/usecase/user/get-user';
import { GetUsersUseCase } from '@/server/usecase/user/get-users';

const userRepository = new DrizzleUserRepository();

export const getUsersUseCase = new GetUsersUseCase(userRepository);
export const getUserUseCase = new GetUserUseCase(userRepository);
export const createUserUseCase = new CreateUserUseCase(userRepository);

const dailyReportRepository = new DrizzleDailyReportRepository();

export const getDailyReportsUseCase = new GetDailyReportsUseCase(
  dailyReportRepository,
);
export const getDailyReportUseCase = new GetDailyReportUseCase(
  dailyReportRepository,
);
