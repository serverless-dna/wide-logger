import middy from '@middy/core';
import { lambdaTestContext, lambdaTestEvent, lambdaTestEventLogOutputJson, MyEvent } from './fixtures';
import { WideLogger } from '../../src';
import { WideLoggerMiddleware, WideLoggerMiddy } from '../../src/middleware';

describe('middy middleware', () => {
  const wideLogger = new WideLogger();
  const consoleLogSpy = jest.spyOn(console, 'log');
  const middyMiddleware = WideLoggerMiddy(wideLogger);

  const middlewareAfterSpy = jest.spyOn(middyMiddleware, 'after');
  const middlewareErrorSpy = jest.spyOn(middyMiddleware, 'onError');

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
});

