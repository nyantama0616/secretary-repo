import { DrizzleUserRepository } from '@/server/infrastructure/db/drizzle-user-repository';
import { CreateUserUseCase } from '@/server/usecase/user/create-user';
import { GetUserUseCase } from '@/server/usecase/user/get-user';
import { GetUsersUseCase } from '@/server/usecase/user/get-users';

const userRepository = new DrizzleUserRepository();

export const getUsersUseCase = new GetUsersUseCase(userRepository);
export const getUserUseCase = new GetUserUseCase(userRepository);
export const createUserUseCase = new CreateUserUseCase(userRepository);
