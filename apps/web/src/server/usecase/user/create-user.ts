import * as v from 'valibot';

import { AlreadyExistsError } from '@/server/domain/error/domain-errors';
import { type User, createUser } from '@/server/domain/user/user';
import type { UserRepository } from '@/server/domain/user/user-repository';

export const CreateUserInputSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  email: v.pipe(v.string(), v.email()),
});

type CreateUserInput = v.InferOutput<typeof CreateUserInputSchema>;

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new AlreadyExistsError('User', input.email);
    }

    const user = createUser({
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
    });

    await this.userRepository.save(user);

    return user;
  }
}
