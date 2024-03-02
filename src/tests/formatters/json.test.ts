import { JsonFormatter } from '../../formatters';
import { WideLogger } from '../../index';

it('should format the log container as a json stringified object', () => {

  const formatter = new JsonFormatter();
  const logger = new WideLogger(formatter);
  const container = logger.container;

  expect(formatter.format(logger.container)).toBe('{}');
});