
export interface MyEvent {
  type: string;
  group: string;
  name: string;
}

export const lambdaTestEvent = {
  type: 'test',
  name: 'thing',
  service: 'the-service',
};

export const lambdaTestEventLogOutputJson = '{"type":"test","name":"thing","service":"the-service"}';

export const lambdaTestContext = {
  callbackWaitsForEmptyEventLoop: true,
  functionName: 'func',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:a-lambda-function',
  memoryLimitInMB: '100',
  awsRequestId: 'oo1',
  logGroupName: 'loggroup',
  logStreamName: 'stream',
  getRemainingTimeInMillis: () => 1000,
  done: () => { },
  fail: () => { },
  succeed: () => { },
};