import { SendMessageBatchRequestEntry, SQSClient } from "@aws-sdk/client-sqs";
import { fetchData } from "../db/queries";
import { Client } from "pg";
import { QueueService } from "../helpers/QueueService";
import { HealthCheck, Locations } from "../models/HealthCheck";
import _ = require("lodash");
import { Context, EventBridgeEvent } from "aws-lambda";
import { interval } from "../models/enums";
import getPool from "../db";


const RegionKeyToLabel: { [key: string]: keyof typeof Locations } = {
  'eu-central-1': Locations.FRANKFURT,
  'eu-west-1': Locations.IRELAND,
  'ap-southeast-2': Locations.SYDNEY,
  'us-west-1': Locations.CALIFORNIA,
  'me-central-1': Locations.DUBAI
};
type Queues = { [key: string]: QueueService }
export const run = async (event: EventBridgeEvent<any, any>, context: Context) => {
  console.log('Fn Name: ', context.functionName, " event: ", event)
  // console.log()
  // console.log(process.env)
  const routeArr = context.functionName.split("-")
  const route = routeArr[routeArr.length - 1]
  const queues = Object.entries(RegionKeyToLabel).reduce<Queues>((prev, [regionKey, regionLabel]) => {
    prev[regionLabel] = new QueueService(new SQSClient({
      region: regionKey,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "",
        secretAccessKey: process.env.ACCESS_KEY || ""
      }
    }), `https://sqs.${regionKey}.amazonaws.com/387070877324/PROD_METRIC_HEALTH_CHECK`)
    return prev
  }, {})

  const client: Client = getPool()
  await client.connect()

  // @ts-ignore
  const intervalSec = interval[route]

  console.log('For Interval: ', intervalSec)

  await processTask(client, queues, intervalSec)
}
const processTask = async (client: Client, queues: Queues, interval: number) => {
  try {
    const data = await fetchData(client, interval)
    client.end()
    const tasks = data.rows
    await sendDataToSQS(tasks, queues)
  }
  catch (e) {
    console.error('Error occured', e)
  }
}
const sendDataToSQS = async (data: HealthCheck[], queues: Queues, onRollback?: (data: (string | undefined)[]) => void) => {

  const locationMessages: { [key: string]: SendMessageBatchRequestEntry[] } = {}

  data.forEach((task) => {
    task.locations.forEach((location) => {
      if (!locationMessages[location]) locationMessages[location] = []
      locationMessages[location].push({
        MessageAttributes: {},
        MessageBody: JSON.stringify(task),
        Id: task.id
      })
    })
  })

  let promises: Promise<any>[] = []
  for (const [location, sqsMsgs] of Object.entries(locationMessages)) {

    try {
      if(!queues[location]) throw new Error(`Queue not found for location: ${location}`)
      const chunks = _.chunk(sqsMsgs, 10)
      promises.push(...chunks.map(chunk => queues[location].sendBatchMessage(chunk).catch((err) => {
        console.log(err)
        if (onRollback) {
          onRollback(chunk.map(item => item.Id))
        }
      })
      ))
    }
    catch (e) {
      // FIXME: Handle errors
      console.log('Error occured: ', e)
    }
  }

  // const chunks = _.chunk(messages, 10)


  return await Promise.all(promises)
}
