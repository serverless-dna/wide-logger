import middy from '@middy/core';
import { lambdaTestContext, lambdaTestEvent, MyEvent } from './fixtures';
import { WideLogger, WideLoggerMiddleware, WideLoggerMiddy, getXrayTraceData } from '../../index';

describe('middy middleware', () => {
  process.env._X_AMZN_TRACE_ID = 'Root=1-65e3369e-3d1b296f5b08533f7e899187;Parent=45cac5110a610bc4;Sampled=0;Lineage=0439e26f:0';
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
    middlewareContextAfterSpy.mockClear();
    middlewareContextErrorSpy.mockClear();
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

  const eventOutput = {
    service: lambdaTestEvent.name,
    startEpoch: 1709358407383,
    group: null,
    type: lambdaTestEvent.type,
  };

  // const getEventOutput = (success: boolean = true, error:boolean = false, extra: Object = {}) => {
  const getEventOutput = () => {
    return `WIDE ${JSON.stringify(eventOutput)}`;
  };

  const handler = middy<MyEvent, void>()
    .use(middyMiddleware)
    .handler(lambdaHandler);

  const errorHandler = middy<MyEvent, void>()
    .use(middyMiddleware)
    .handler(errorLambdaHandler);

  it('extracts the xRay Trace form environment variable', () => {
    const xRayTraceData = getXrayTraceData();

    expect(xRayTraceData?.Root).toEqual('1-65e3369e-3d1b296f5b08533f7e899187');
  });

  it('returns Middy Middleware with logger', () => {
    const middleware = WideLoggerMiddy(wideLogger);
    expect(middleware).toBeInstanceOf(WideLoggerMiddleware);
    expect(middleware.logger).toBe(wideLogger);
  });

  it('calls the middy handler after and log output is created', async () => {
    // When I call the middy wrapped handler
    await handler(lambdaTestEvent, lambdaTestContext);

    // Then I expect logging to happen in the after
    expect(consoleLogSpy).toHaveBeenCalledWith(getEventOutput());
    expect(middlewareAfterSpy).toHaveBeenCalled();
  });

  it('calls the middy handler onError and log output is created', async () => {
    // When I call the middy wrapped handler
    const testHandler = async () => {
      await errorHandler(lambdaTestEvent, lambdaTestContext);
    };

    await expect(testHandler()).rejects.toThrow();

    // Then I expect logging to happen in the after
    expect(consoleLogSpy).toHaveBeenCalledWith(getEventOutput());
    expect(middlewareErrorSpy).toHaveBeenCalled();
  });

  const contextHandler = middy<MyEvent, void>()
    .use(middyContextMiddleware)
    .handler(lambdaHandler);

  const contextErrorHandler = middy<MyEvent, void>()
    .use(middyContextMiddleware)
    .handler(errorLambdaHandler);

  it('Middy will inject lambda context to logger when option provided from after hook', async () => {
    // When I call the middy wrapped handler
    await contextHandler(lambdaTestEvent, lambdaTestContext);

    // Then I expect logging to happen in the after
    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {\"service\":\"thing\",\"startEpoch\":1709358407383,\"group\":null,\"type\":\"test\",\"lambdaContext\":{\"lambdaFunction\":{\"arn\":\"arn:aws:lambda:us-east-1:123456789012:function:a-lambda-function\",\"name\":\"func\",\"memoryLimitInMB\":\"100\",\"version\":\"1\"},\"awsAccountId\":\"123456789012\",\"awsRegion\":\"us-east-1\",\"correlationIds\":{\"awsRequestId\":\"oo1\",\"xRayTraceId\":\"1-65e3369e-3d1b296f5b08533f7e899187\"},\"remainingTimeInMillis\":1000}}');
    expect(middlewareContextErrorSpy).not.toHaveBeenCalled();
    expect(middlewareContextAfterSpy).toHaveBeenCalled();
  });

  it('Middy will inject lambda context to logger when option provided from onError Hook', async () => {
    const testHandler = async () => {
      await contextErrorHandler(lambdaTestEvent, lambdaTestContext);
    };
    await expect(testHandler()).rejects.toThrow();

    expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {\"service\":\"thing\",\"startEpoch\":1709358407383,\"group\":null,\"type\":\"test\",\"lambdaContext\":{\"lambdaFunction\":{\"arn\":\"arn:aws:lambda:us-east-1:123456789012:function:a-lambda-function\",\"name\":\"func\",\"memoryLimitInMB\":\"100\",\"version\":\"1\"},\"awsAccountId\":\"123456789012\",\"awsRegion\":\"us-east-1\",\"correlationIds\":{\"awsRequestId\":\"oo1\",\"xRayTraceId\":\"1-65e3369e-3d1b296f5b08533f7e899187\"},\"remainingTimeInMillis\":1000}}');
    // expect(consoleLogSpy).toHaveBeenCalledWith('WIDE {\"lambdaContext\":{\"lambdaFunction\":{\"arn\":\"arn:aws:lambda:us-east-1:123456789012:function:a-lambda-function\",\"name\":\"func\",\"memoryLimitInMB\":\"100\",\"version\":\"1\"},\"awsAccountId\":\"123456789012\",\"awsRegion\":\"us-east-1\",\"correlationIds\":{\"awsRequestId\":\"oo1\",\"xRayTraceId\":\"1-65e3369e-3d1b296f5b08533f7e899187\"},\"remainingTimeInMillis\":1000}}');
    expect(middlewareContextErrorSpy).toHaveBeenCalled();
    expect(middlewareContextAfterSpy).not.toHaveBeenCalled();
  });

});

