import {run} from "./functions/processTasks";
import {Context, EventBridgeEvent} from "aws-lambda";

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
    functionName: "task-lambda-dev-MINUTE_5",
    functionVersion: "",
    invokedFunctionArn: "",
    logGroupName: "",
    logStreamName: "",
    memoryLimitInMB: ""
  }
  await run(event, context)
}
event()
