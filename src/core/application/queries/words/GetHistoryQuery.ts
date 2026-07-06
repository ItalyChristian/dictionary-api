import { Query } from '../interfaces/Query';

export class GetHistoryQuery implements Query {
  public readonly queryId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly userId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20
  ) {
    this.queryId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
