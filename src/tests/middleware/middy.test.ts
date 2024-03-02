import middy from '@middy/core';
import { lambdaTestContext, lambdaTestEvent, lambdaTestEventLogOutputJson, MyEvent } from './fixtures';
import { WideLogger, WideLoggerMiddleware, WideLoggerMiddy } from '../../index';

describe('middy middleware', () => {
  const wideLogger = new WideLogger();
  const consoleLogSpy = jest.spyOn(console, 'log');
  const middyMiddleware = WideLoggerMiddy(wideLogger);
  const middyContextMiddleware = WideLoggerMiddy(wideLogger, { injectLambdaContext: true });

  const middlewareAfterSpy = jest.spyOn(middyMiddleware, 'after');
  const middlewareErrorSpy = jest.spyOn(middyMiddleware, 'onError');

  const middlewareContextAfterSpy = jest.spyOn(middyContextMiddleware, 'after');
  const middlewareContextErrorSpy = jest.spyOn(middyContextMiddleware, 'onError');

  afterEach(() => {
    consoleLogSpy.mockClear();
    middlewareAfterSpy.mockClear();
    middlewareErrorSpy.mockClear();
  });

  const lambdaHandler = (event: MyEvent) => {
    wideLogger.add('service', event.name);
    wideLogger.add('startEpoch', 1709358407383);
    wideLogger.add('group', event.group);
    wideLogger.add('type', event.type);
  };

  const errorLambdaHandler = (event: MyEvent) => {
    wideLogger.add('service', event.name);
    wideLogger.add('startEpoch', 1709358407383);
    wideLogger.add('group', event.group);
    wideLogger.add('type', event.type);

    throw new Error('lambda error');
  };

  const eventOutput = `WIDE ${JSON.stringify({
    service: lambdaTestEvent.name,
    startEpoch: 1709358407383,
    group: null,
    type: lambdaTestEvent.type,
  })}`;

  const handler = middy<MyEvent, void>()
    .use(middyMiddleware)
    .handler(lambdaHandler);

  const errorHandler = middy<MyEvent, void>()
    .use(middyMiddleware)
    .handler(errorLambdaHandler);


  it('returns Middy Middelware with logger', () => {
    const middleware = WideLoggerMiddy(wideLogger);
    expect(middleware).toBeInstanceOf(WideLoggerMiddleware);
    expect(middleware.logger).toBe(wideLogger);
  });

  it('calls the middy handler after and log output is created', async () => {
    // When I call the middy wrapped handler
    await handler(lambdaTestEvent, lambdaTestContext);

    // Then I expect logging to happen in the after
    expect(consoleLogSpy).toHaveBeenCalledWith(eventOutput);
    expect(middlewareAfterSpy).toHaveBeenCalled();
  });

  it('calls the middy handler onError and log output is created', async () => {
    // When I call the middy wrapped handler
    const testHandler = async () => {
      await errorHandler(lambdaTestEvent, lambdaTestContext);
    };

    await expect(testHandler()).rejects.toThrow();

    // Then I expect logging to happen in the after
    expect(consoleLogSpy).toHaveBeenCalledWith(eventOutput);
    expect(middlewareErrorSpy).toHaveBeenCalled();
  });

  const contextHandler = middy<MyEvent, void>()
    .use(middyContextMiddleware)
    .handler(lambdaHandler);

  it('Middy will inject lambda context to logger when option provided', async () => {
    // When I call the middy wrapped handler
    await contextHandler(lambdaTestEvent, lambdaTestContext);

    // Then I expect logging to happen in the after
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {\"service\":\"thing\",\"startEpoch\":1709358407383,\"group\":null,\"type\":\"test\",\"lambdaContext\":{\"lambdaFunction\":{\"arn\":\"arn:aws:lambda:us-east-1:123456789012:function:a-lambda-function\",\"name\":\"func\",\"memoryLimitInMB\":\"100\",\"version\":\"1\"},\"awsAccountId\":\"123456789012\",\"awsRegion\":\"us-east-1\",\"correlationIds\":{\"awsRequestId\":\"oo1\",\"xRayTraceId\":\"oo1\"},\"remainingTimeInMillis\":1000}}');
    expect(middlewareContextErrorSpy).not.toHaveBeenCalled();
    expect(middlewareContextAfterSpy).toHaveBeenCalled();
  });

});

