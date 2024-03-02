import { LogFormatter } from './formatters';
import { JsonFormatter } from './formatters/json';

export type LogKey = string;
export type LogValue = string | number | boolean | null | Object;
export interface WideLogContainer {
  [key: string]: LogValue;
}

/**
 * Manages a Canonical Wide log container of key/value pairs.
 * Wide log entries are written using ```console.log()```.
 */
export class WideLogger {
  /**
   * The container of key/value pairs
   * @private
   */
  private logContainer: WideLogContainer;
  /**
   * The log formatter to format the output when flushed via console.log()
   * @default json
   * @private
   */
  private logFormatter: LogFormatter;

  constructor(formatter?: LogFormatter) {
    this.logContainer = {};
    this.logFormatter = formatter || new JsonFormatter();
  }

  public flush() {
    console.log('WIDE ' + this.logFormatter.format(this.logContainer));
    this.clear();
  }

  /**
   * Add a key/value pair to the logContainer.
   * @param key
   * @param value
   */
  public add(key: LogKey, value: LogValue) {
    if (this.logContainer[key]) {
      console.warn(`Overwriting key '${key}'`, { old: this.logContainer[key], new: value });
    }
    if (value === undefined) {
      value = null;
    }
    this.logContainer[key] = value;
  }

  /**
   * Remove a key from the logContainer.
   * @param key
   */
  public remove(key: LogKey) {
    delete this.logContainer[key];
  }

  /**
   * Clear the logContainer.
   */
  public clear() {
    this.logContainer = {};
  }

  /**
   * return the log container
   * @returns WideLogContainer
   */
  get container(): WideLogContainer {
    return this.logContainer;
  }

  /**
   * return the log formatter
   * @returns LogFormatter
   */
  get formatter(): LogFormatter {
    return this.logFormatter;
  }
}

