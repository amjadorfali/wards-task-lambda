import {SendMessageBatchRequestEntry, SQSClient} from "@aws-sdk/client-sqs";
import {fetchData} from "../db/queries";
import {Client} from "pg";
import {QueueService} from "../helpers/QueueService";
import {HealthCheck} from "../models/HealthCheck";
import _ = require("lodash");
import {Context, EventBridgeEvent} from "aws-lambda";
import {interval} from "../models/enums";
import getPool from "../db";




export const run = async (event: EventBridgeEvent<any, any>, context: Context) => {
  const sqs = new SQSClient({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID || "",
      secretAccessKey: process.env.ACCESS_KEY || ""
    }
  });
  console.log(context)
  console.log("event", event)
  console.log(process.env)
  const routeArr = context.functionName.split("-")
  const route = routeArr[routeArr.length - 1]
  const queue = new QueueService(sqs, "https://sqs.eu-central-1.amazonaws.com/387070877324/PROD_METRIC_HEALTH_CHECK")
  const client: Client = getPool()
  await client.connect()

  // @ts-ignore
  const intervalSec = interval[route]

  console.log(intervalSec)

  await processTask(client, queue, intervalSec)
}
const processTask = async (client: Client, queue: QueueService, interval: number) => {
  try {
    const data = await fetchData(client, interval)
    client.end()
    const tasks = data.rows
    sendDataToSQS(tasks, queue)
  }
  catch (e) {
    console.error(e)
  }
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
