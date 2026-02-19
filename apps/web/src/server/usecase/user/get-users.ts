import type { User } from '@/server/domain/user/user';
import type { UserRepository } from '@/server/domain/user/user-repository';

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
