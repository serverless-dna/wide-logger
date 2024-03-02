# Wide Logger

A canonical wide logger that is built to gather key, value pairs and then flush them all to the console
in a single log message.  This does not replace your existing detailed debug logging, it is an addition.  All logs emitted by the Wide Logger will be prefixed by `WIDE` so you can quickly and easily find them or use filtered subscriptions to record these in a single place for easy searching and correlation.

## Usage

Create at the start, add anywhere, flush at the end.

```typescript
import { WideLogger } from '@serverless-dna/wide-logger';

const wideLogger = new WideLogger()

const serviceProcessor = async (data: Record<string, any>) => {
    
    try {
        wideLogger.add('startEpoch', Date.now());
        wideLogger.add('premiumUser', data.premiumUser ?? false);

        // ... do some processing here
        if (data.premiumUser && data.premium.goupA) {
            wideLogger.add('premiumGroup', 'A');
        }
    } finally {
        wideLogger.flush();
    }
}
```

The log output will be:
`WIDE {"startEpoch":1709335919083,"premiumUser":true,"premiumGroup:"A"}`

When the Wide Logger is flushed it will do so using **console.log()** and will use the **LogFormatter** passed with a default of JSON (Object) output. 

Included are a **JsonFormatter** and **KeyValueFormatter**.  You can create your own if you have a specific format requirement.

```typescript
import { WideLogger } from '@serverless-dna/wide-logger';
import { KeyValueFormatter } from '@serverless-dna/wide-logger';

const wideLogger = new WideLogger(new KeyValueFormatter())

const serviceProcessor = async (data: Record<string, any>) => {
    try {
        wideLogger.add('startEpoch', Date.now());
        wideLogger.add('premiumUser', data.premiumUser ?? false);

        // ... do some processing here
        if (data.premiumUser && data.premium.goupA) {
            wideLogger.add('premiumGroup', 'A');
        }
    } finally {
        wideLogger.flush();
    }
}
```

Using the KeyValueFormatter will output the following:

`WIDE startEpoch=1709335919083|premiumUser=true|premiumGroup="A"`

The **KeyValueFormatter** also accepts a seperator character in the constructor so you can use your own custom seperator for your log ingestion engine with a default of '|'.

## Middy Middleware Usage

We have also packaged a middleware class for [MiddyJs](https://github.com/middyjs/middy) users to simplify your WideLogging needs.

The **after** middleware will automatically add the folllwoing meta-data key: `{ error: false, success: 1 }`
The **onError** middleware will automatically add the following meta-data keys: `{ error: true, errorDetail: "<Error message>", success: 0}`.

The addition of the `success` key enables you to query logs for transactions grouped by lambda function to find those that never succeeded by using a sum of the success meta-data.  The sum will either be 1 for a successful transaction, or 0 for a transaction which failed.  This is especially useful when you have automated recovery of failed lambda invocations.  if you find a sum of the success meta-data yields a count > 1 then you need to investigate idempotency within your solution as this would indicate a transaction being processed twice!



```typescript
import middy from '@middy/core';
import { WideLogger, WideLoggerMiddy } from '@serverless-dna/wide-logger';

const wideLogger = new WideLogger()

const lambdaHandler = (event, context) => {
    wideLogger.add('service', 'mySpecialService')
    wideLogger.add('startEpoch', Date.now());
  /* your business logic */

}

export const handler = middy()
  .use(WideLoggerMiddy(wideLogger))
  .handler(lambdaHandler)
```

### Injecting AWS Lambda Context

You can optionally include relevant details from the AWS Lambda function context within each Wide log entry.  This will be added as a single key/object value pair.  The **KeyValueFormatter** uses JSON.stringify to format values, so if you use this formatter be aware that the lambda context is an encoded string value.

The context injected has the following structure.

```json
{
    "lambdaContext":
    {
        "lambdaFunction":
        {
            "arn": "arn:aws:lambda:us-east-1:123456789012:function:your-lambda-function",
            "name": "your-lambda-function",
            "memoryLimitInMB": "256",
            "version": "$LATEST"
        },
        "awsAccountId": "123456789012",
        "awsRegion": "us-east-1",
        "correlationIds":
        {
            "awsRequestId": "017100a8-3d65-40bb-aae1-673367af29b3",
            "xRayTraceId": "017100a8-3d65-40bb-aae1-673367af29b3"
        },
        "remainingTimeInMillis": 2999
    }
}
```

You can enable injecting the AWS Lmabda Context into your Wide log messages as shown here.

```typescript
import middy from '@middy/core';
import { WideLogger, WideLoggerMiddy } from '@serverless-dna/wide-logger';

const wideLogger = new WideLogger()

const lambdaHandler = (event, context) => {
    wideLogger.add('service', 'mySpecialService')
    wideLogger.add('startEpoch', Date.now());
  /* your business logic */

}

export const handler = middy()
  .use(WideLoggerMiddy(wideLogger, { injectLambdaContext: true }))
  .handler(lambdaHandler)
```

## Why Wide Logs?

Traces, Log entries and metrics are great and form an essential part of your monitoring tool-kit for the more
technical aspects of your system, for example CPU usage, Throttling, Memory usage.  But there is more to
observing a distributed system so you need to log meta-data about your business functions, users, external dependencies,
and other key criteria for enabling you to search your logs and discover the more Unknown Unknowns.

Wide logging is a technique where you write a single log message per transaction, per service.  With the WideLogger class
you can add key-value metadata at any point it makes sense in your code - perhaps it's meta-data about a specific if statement
that is run, the latency of an external dependency, the duration of distributed service processing or perhaps it's a version stamp
linking back to the actual release artifact for your service.  It can be anything at all - the more you pack in, the more cardinality you will
get when trying to search data about what your system is doing.  At the end of your transaction call the **flush()** method to write your wide log entry.






