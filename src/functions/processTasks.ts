import {SendMessageBatchRequestEntry, SQSClient} from "@aws-sdk/client-sqs";
import {fetchData} from "../db/queries";
import {Pool} from "pg";
import {QueueService} from "../helpers/QueueService";
import {HealthCheck} from "../models/HealthCheck";
import _ = require("lodash");
import {Context, EventBridgeEvent} from "aws-lambda";
import {interval} from "../models/enums";
import getPool from "../db";


const sqs = new SQSClient({
  credentials: {
    accessKeyId: "AKIA5OBEIXRZ455SL26Z",
    secretAccessKey: "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"
  }
});

export const run = async (event: EventBridgeEvent<any, any>, context: Context) => {
  console.log(context)
  console.log("event", event)
  const routeArr = context.functionName.split("-")
  const route = routeArr[routeArr.length - 1]
  const queue = new QueueService(sqs, "https://sqs.eu-central-1.amazonaws.com/923494038643/PROD_METRIC_HEALTH_CHECK")
  const pool: Pool = getPool()
  await pool.connect()

  // @ts-ignore
  const intervalSec = interval[route]

  console.log(intervalSec)

  await process(pool, queue, intervalSec)
}
const process = async (pool: Pool, queue: QueueService, interval: number) => {
  const data = await fetchData(pool, interval)
  const tasks = data.rows
  sendDataToSQS(tasks, queue)
}
const sendDataToSQS = (data: HealthCheck[], queue: QueueService, onRollback?: (data: (string | undefined)[]) => void) => {
  const messages: SendMessageBatchRequestEntry[] = data.map(task => {
    return {
      MessageAttributes: {},
      MessageBody: JSON.stringify(task),
      Id: task.id
    }
  })
  const chunks = _.chunk(messages, 10)
  chunks.forEach(chunk => {
    queue.sendBatchMessage(chunk).catch((err) => {
      console.log(err)
      if (onRollback) {
        onRollback(chunk.map(item => item.Id))
      }
    })
  })

}
