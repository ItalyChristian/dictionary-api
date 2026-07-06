import { User } from '../entities/User';
import { FavoriteEntry } from './types/FavoriteEntry';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
  findFavoritesByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ entries: FavoriteEntry[]; total: number }>;
}
