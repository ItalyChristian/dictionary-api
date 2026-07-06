import { Query } from '../interfaces/Query';

export class GetFavoritesQuery implements Query {
  public readonly queryId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string
  ) {
    this.queryId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
