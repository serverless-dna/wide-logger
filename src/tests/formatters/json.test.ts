import { JsonFormatter } from '../../formatters';
import { WideLogger } from '../../index';

describe('JsonFormatter', () => {
  const consoleLogSpy = jest.spyOn(console, 'log');

  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  it('should format the log container as a json stringified object', () => {
    const formatter = new JsonFormatter();
    const logger = new WideLogger(formatter);
    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {}');
  });
});