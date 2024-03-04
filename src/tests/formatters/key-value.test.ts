
import { KeyValueFormatter } from '../../formatters';
import { WideLogger } from '../../index';


describe('KeyValueFormatter', () => {
  const formatter = new KeyValueFormatter();
  const logger = new WideLogger(formatter);
  const consoleLogSpy = jest.spyOn(console, 'log');

  afterEach(() => {
    consoleLogSpy.mockClear();
  });

  it('should format the log container as a key-value string', () => {
    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE ');
  });

  it('should format the log container as a key-value string seperated by | chars', () => {
    logger.add('key', 'value');
    logger.add('key2', true);
    logger.add('key3', 123456);

    logger.flush();
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE key="value"|key2=true|key3=123456');
  });
});

