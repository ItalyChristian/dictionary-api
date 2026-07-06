import { Query } from '../interfaces/Query';

export class GetWordsQuery implements Query {
  public readonly queryId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly search: string | undefined,
    public readonly limit: number = 10,
    public readonly cursor?: string
  ) {
    this.queryId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
