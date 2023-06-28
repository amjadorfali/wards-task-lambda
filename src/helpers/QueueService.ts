import {
  SendMessageBatchCommand,
  SQSClient,
  SendMessageBatchRequestEntry
} from "@aws-sdk/client-sqs";

export class QueueService {
  client: SQSClient
  url: string

  constructor(client: SQSClient, url: string) {
    this.client = client;
    this.url = url;
  }

  sendBatchMessage(message: SendMessageBatchRequestEntry[]): Promise<any> {
    const command = new SendMessageBatchCommand({
      Entries: message,
      QueueUrl: this.url,
    });
    console.log(command)
    return this.client.send(command);
  }


}
