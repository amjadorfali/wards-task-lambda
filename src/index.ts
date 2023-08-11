import {run} from "./functions/processTasks";
import {Context, EventBridgeEvent} from "aws-lambda";
let environment = process.env.ACTIVE_PROFILE;

if (!environment || environment === 'development') {
  require('dotenv').config();
  environment = process.env.ACTIVE_PROFILE;
}
const event = async () => {

  const event: EventBridgeEvent<any, any> = {
    "detail-type": undefined,
    account: "",
    detail: undefined,
    id: "",
    region: "",
    resources: [],
    source: "",
    time: "",
    version: ""
  }
  const context: Context = {
    done(error?: Error, result?: any): void {
    }, fail(error: Error | string): void {
    }, getRemainingTimeInMillis(): number {
      return 0;
    }, succeed(message: any, object?: any): void {
    },
    awsRequestId: "",
    callbackWaitsForEmptyEventLoop: false,
    functionName: "task-lambda-dev-MINUTE_3",
    functionVersion: "",
    invokedFunctionArn: "",
    logGroupName: "",
    logStreamName: "",
    memoryLimitInMB: ""
  }
  await run(event, context)
}
event()
