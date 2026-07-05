import { Query } from '../interfaces/Query';

export class GetWordQuery implements Query {
  public readonly queryId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly word: string,
    public readonly userId?: string
  ) {
    this.queryId = crypto.randomUUID();
    this.occurredOn = new Date();
  }
}
