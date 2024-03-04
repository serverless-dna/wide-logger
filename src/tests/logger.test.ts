import { JsonFormatter } from '../formatters';
import { WideLogger } from '../index';

describe('testing WideLogger', () => {
  const logger = new WideLogger();
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
    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"key":"value","key2":"value2"}');
  });

  it('should remove the key from the container', () => {
    logger.add('key', 'value');
    logger.add('key2', 'value2');
    logger.remove('key');
    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"key2":"value2"}');
  });

  it('should clear the container', () => {
    logger.add('key', 'value');
    logger.add('key2', 'value2');
    logger.clear();
    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {}');
  });

  it('should print out to console the log container', () => {
    logger.add('key', 'value');
    logger.add('key2', 'value2');
    logger.flush();

    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"key":"value","key2":"value2"}');
    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {}');
  });

  it('should include persistent attributes added to the container at construction time', () => {
    const extraLogger = new WideLogger({
      persistentAttributes: {
        myKey: 'myValue',
        complexKey: {
          key: 'value',
        },
      },
    });

    extraLogger.add('singleKey', 'single value');
    extraLogger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"myKey":"myValue","complexKey":{"key":"value"},"singleKey":"single value"}');
    consoleLogSpy.mockClear();
    extraLogger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"myKey":"myValue","complexKey":{"key":"value"}}');
  });

  it('should allow adding of complex object via addObject', () => {
    logger.add('key', 'value');
    logger.add('key2', 'value2');
    logger.addObject({
      key3: 'value3',
      complex: {
        complexKey: 'complexValue',
      },
    });
    logger.flush();

    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {"key":"value","key2":"value2","key3":"value3","complex":{"complexKey":"complexValue"}}');
  });

});