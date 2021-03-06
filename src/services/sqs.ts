import SQS from "aws-sdk/clients/sqs";
import * as config from "../config";

export const sendMessage = (message: any) => {
  const c =
    (config.awsSqs.sessionToken && {
      sessionToken: config.awsSqs.sessionToken
    }) ||
    (config.awsSqs.accessKeyId && {
      accessKeyId: config.awsSqs.accessKeyId,
      secretAccessKey: config.awsSqs.secretAccessKey,
      region: config.awsSqs.region
    }) ||
    {};

  const sqs = new SQS(c);

  const [, , , region, id, queueName] = config.awsSqs.queueArn.split(":");

  const queueUrl = `https://sqs.${region}.amazonaws.com/${id}/${queueName}`;

  return sqs
    .sendMessage({
      MessageBody: JSON.stringify(message),
      QueueUrl: queueUrl
    })
    .promise();
};
