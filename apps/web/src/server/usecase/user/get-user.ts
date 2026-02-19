import * as v from 'valibot';

import { NotFoundError } from '@/server/domain/error/domain-errors';
import type { User } from '@/server/domain/user/user';
import type { UserRepository } from '@/server/domain/user/user-repository';

export const GetUserInputSchema = v.object({
  id: v.string(),
});

type GetUserInput = v.InferOutput<typeof GetUserInputSchema>;

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: GetUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundError('User', input.id);
    }

    return user;
  }
}
