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

export interface WideLoggerMiddyOptions {
  /**
   * include AWS Lambda Context
   * @default false
   */
  injectLambdaContext?: boolean;
}

export class WideLoggerMiddleware implements MiddlewareObj {

  /**
   * WideLogger instance to be managed by the Middelware.
   * @private
   */
  private readonly theLogger: WideLogger;
  /**
   * Middleware Options
   */
  private readonly options: WideLoggerMiddyOptions;

  get logger(): WideLogger {
    return this.theLogger;
  }

  constructor(logger: WideLogger, options?: WideLoggerMiddyOptions) {
    this.theLogger = logger;
    this.options = options ?? {};
    this.before = this.before.bind(this);
    this.after = this.after.bind(this);
    this.onError = this.onError.bind(this);
  }

  public before(request: Request): void {
    if (this.options?.injectLambdaContext) {
      this.injectLambdaContext(request.context);
    }
  }

  protected injectLambdaContext(context: LambdaContext) {
    this.theLogger.add('lambdaContext', {
      lambdaFunction: {
        arn: context.invokedFunctionArn,
        name: context.functionName,
        memoryLimitInMB: context.memoryLimitInMB,
        version: context.functionVersion,
      },
      awsAccountId: context.invokedFunctionArn.split(':')[4],
      awsRegion: context.invokedFunctionArn.split(':')[3],
      correlationIds: {
        awsRequestId: context.awsRequestId,
        xRayTraceId: context.awsRequestId,
      },
      remainingTimeInMillis: context.getRemainingTimeInMillis(),
    });
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
export const WideLoggerMiddy = (logger: WideLogger, options?: WideLoggerMiddyOptions) => {
  return new WideLoggerMiddleware(logger, options);
};
