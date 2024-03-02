import { WideLogger } from '../src';
import { JsonFormatter } from '../src/formatters';

describe('testing WideLogger', () => {
  const logger = new WideLogger();
  const formatter = new JsonFormatter();
  const consoleLogSpy = jest.spyOn(console, 'log');

  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  it('formatter should default to JsonFormatter', () => {
    expect(logger.formatter).toBeInstanceOf(JsonFormatter);
  });

  it('should add key/value to container', () => {
    logger.add('key', 'value');
    logger.add('key2', 'value2');
    expect(logger.container).toEqual({ key: 'value', key2: 'value2' });
  });

  it('should remove the key from the container', () => {
    logger.remove('key');
    expect(logger.container).toEqual({ key2: 'value2' });
  });

  it('should clear the container', () => {
    logger.clear();
    expect(logger.container).toEqual({});
  });

  it('should print out to console the log container', () => {
    logger.add('key', 'value');
    logger.add('key2', 'value2');


    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"key":"value","key2":"value2"}');
    expect(logger.container).toEqual({});
  });

  it('should warn when I overwrite a container key', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn');
    logger.add('key', 'value');
    logger.add('key', 100);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Overwriting key \'key\'', { old: 'value', new: 100 });
  });

});