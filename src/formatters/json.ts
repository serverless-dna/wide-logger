/**
 * json Formatter for wide log format output
 */
import { LogFormatter, LogFormat } from './base';
import { WideLogContainer } from '../logger';

/**
 * no-op class for outputting Log container in json format.
 * @class JsonFormatter
 * @implements {LogFormatter}
 */
export class JsonFormatter implements LogFormatter {
  format(logContainer: WideLogContainer): LogFormat {
    return JSON.stringify(logContainer);
  }
}