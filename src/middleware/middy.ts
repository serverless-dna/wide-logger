import { MiddlewareObj } from '@middy/core';
import { Context as LambdaContext } from 'aws-lambda';
import { WideLogger } from '../logger';

export interface Request<TEvent = any, TResult = any, TErr = Error> {
  event: TEvent;
  context: LambdaContext;
  response: TResult | null;
  error: TErr | null;
  internal: {
    [key: string]: any;
  };
}

export class WideLoggerMiddleware implements MiddlewareObj {

  /**
   * WideLogger instance to be managed by the Middelware.
   * @private
   */
  private readonly theLogger: WideLogger;

  get logger(): WideLogger {
    return this.theLogger;
  }

  constructor(logger: WideLogger) {
    this.theLogger = logger;
    this.after = this.after.bind(this);
    this.onError = this.onError.bind(this);
  }

  /**
   * Flush the WideLogEntry after the handler has finished
   * @param requests
   */
  public after(request: Request): void {
    this.theLogger.flush();
  }

  /**
   * Flush the WideLogEntry on Error.  The logger assumes error details will already be propagated into the WideLogContainer at this point.
   * @param request
   */
  public onError(request: Request): void {
    this.theLogger.flush();
  }
}

/**
 * Create Middy Middleware to manage the WideLogger.
 * @param logger teh Wide Logger to manage
 * @returns Middy Middleware instance
 */
export const WideLoggerMiddy = (logger: WideLogger) => {
  return new WideLoggerMiddleware(logger);
};
