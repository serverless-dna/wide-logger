/**
 * key=value Formatter for wide log format output
 */
import { LogFormatter, LogFormat } from './base';
import { LogValue, WideLogContainer } from '../logger';

/*
 * key=value Formatter for wide log format output
 * @param seperator seperator between key and value, default is '|'
 * @returns KeyValueFormatter instance
 * @example
 * const formatter = new KeyValueFormatter();
 * const log = formatter.format({ key: 'value' }
 */
export class KeyValueFormatter implements LogFormatter {
  private separator: string;

  constructor(separator?: string) {
    this.separator = separator ?? '|';
  }

  format(logContainer: WideLogContainer): LogFormat {
    return Object.keys(logContainer)
      .map(key => `${key}=${JSON.stringify(logContainer[key])}`)
      .join(this.separator);
  }
}