
import { KeyValueFormatter } from '../../formatters';
import { WideLogger } from '../../index';


describe('KeyValueFormatter', () => {
  const formatter = new KeyValueFormatter();
  const logger = new WideLogger(formatter);
  const container = logger.container;

  it('should format the log container as a key-value string', () => {
    expect(formatter.format(container)).toBe('');
  });

  it('should format the log container as a key-value string seperated by | chars', () => {
    logger.add('key', 'value');
    logger.add('key2', true);
    logger.add('key3', 123456);
    expect(formatter.format(container)).toBe('key="value"|key2=true|key3=123456');
  });
});

