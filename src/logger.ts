import { LogFormatter, JsonFormatter } from './formatters';

export type LogKey = string;
export type LogValue = string | number | boolean | null | Object;
export interface WideLogContainer {
  [key: string]: LogValue;
}

export interface WideLogOptions {}

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
  private readonly logFormatter: LogFormatter;

  /**
   * Wide Log Options
   * @private
   */

  private readonly options: WideLogOptions;
  /**
   * Create a new WideLogger instance.
   * @param formatter
   * @param options
   */
  constructor(formatter?: LogFormatter, options: WideLogOptions = {}) {
    this.logContainer = {};
    this.options = options;
    this.logFormatter = formatter || new JsonFormatter();
  }

  /**
   * Flush the logContainer to the console.log() using the logFormatter.
   */
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
    /**
     * If value is undefined this will be filtered out by formatters using JSON.stringify to encode
     * values (e.g. KeyValueFormatter and JSONFormatter).  If undefined is passed in change it to null
     * so the meta-data is emitted with no value rather than excluded causing confusion.
     */
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
   * return the log formatter
   * @returns LogFormatter
   */
  get formatter(): LogFormatter {
    return this.logFormatter;
  }
}