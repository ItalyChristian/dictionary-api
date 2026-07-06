import { describe, it, expect, vi } from 'vitest';
import { CommandBus } from '@core/application/commands/CommandBus';
import type { Command } from '@core/application/commands/interfaces/Command';
import type { CommandHandler } from '@core/application/commands/interfaces/CommandHandler';

class SampleCommand implements Command {
  readonly commandId = 'c-1';
  readonly occurredOn = new Date(0);
  constructor(public readonly payload: string) {}
}

describe('CommandBus', () => {
  it('dispatches a command to its registered handler', async () => {
    const bus = new CommandBus();
    const handler: CommandHandler<SampleCommand, string> = {
      handle: vi.fn().mockResolvedValue('ok')
    };

    bus.register('SampleCommand', handler);
    const result = await bus.execute<SampleCommand, string>(
      new SampleCommand('hi')
    );

    expect(result).toBe('ok');
    expect(handler.handle).toHaveBeenCalledOnce();
  });

  it('throws when no handler is registered', async () => {
    const bus = new CommandBus();
    await expect(bus.execute(new SampleCommand('hi'))).rejects.toThrow(
      'No handler registered for command SampleCommand'
    );
  });

  it('resolves the handler by the command constructor name', async () => {
    const bus = new CommandBus();
    const handler: CommandHandler<SampleCommand, string> = {
      handle: vi.fn(async (cmd: SampleCommand) => cmd.payload.toUpperCase())
    };
    bus.register('SampleCommand', handler);

    expect(await bus.execute<SampleCommand, string>(new SampleCommand('hey'))).toBe(
      'HEY'
    );
  });
});
