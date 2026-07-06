import { UserRepository } from '../../core/domain/repositories/UserRepository';
import { User } from '../../core/domain/entities/User';
import { db } from '../database/connection.js';
import { users, userFavorites } from '../database/drizzle-schema.js';
import { and, eq } from 'drizzle-orm';

export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const favorites = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, id));

    return User.reconstitute(
      result[0].id,
      result[0].name,
      result[0].email,
      result[0].password,
      favorites.map((favorite: { wordId: string }) => favorite.wordId),
      result[0].createdAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) return null;

    const favorites = await db
      .select()
      .from(userFavorites)
      .where(eq(userFavorites.userId, result[0].id));

    return User.reconstitute(
      result[0].id,
      result[0].name,
      result[0].email,
      result[0].password,
      favorites.map((favorite: { wordId: string }) => favorite.wordId),
      result[0].createdAt
    );
  }

  async save(user: User): Promise<void> {
    await db.transaction(async (trx: any) => {
      await trx
        .insert(users)
        .values({
          id: user.getId(),
          name: user.getName(),
          email: user.getEmail(),
          password: user.getPassword(),
          createdAt: user.getCreatedAt()
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: user.getName(),
            email: user.getEmail(),
            password: user.getPassword()
          }
        });

      const currentFavorites = await trx
        .select()
        .from(userFavorites)
        .where(eq(userFavorites.userId, user.getId()));

      const favoriteIds = new Set(user.getFavorites().map((favorite) => favorite.getValue()));
      const currentFavoriteIds = new Set(currentFavorites.map((favorite: { wordId: string }) => favorite.wordId));

      for (const current of currentFavorites) {
        if (!favoriteIds.has(current.wordId)) {
          await trx
            .delete(userFavorites)
            .where(
              and(
                eq(userFavorites.userId, user.getId()),
                eq(userFavorites.wordId, current.wordId)
              )
            );
        }
      }

      for (const favorite of user.getFavorites()) {
        if (!currentFavoriteIds.has(favorite.getValue())) {
          await trx
            .insert(userFavorites)
            .values({
              userId: user.getId(),
              wordId: favorite.getValue(),
              favoritedAt: new Date()
            });
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async exists(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0;
  }
}