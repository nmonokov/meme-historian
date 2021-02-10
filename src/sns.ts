import { SNS } from 'aws-sdk';
import * as log from 'loglevel';

const { S3_BUCKET_NAME, SUGGEST_FOLDER, SNS_TOPIC_ARN } = process.env;
const sns = new SNS();

export const notifyAdmin = async (imageKey: string): Promise<void> => {
  const params = {
    Message: `Image has been suggested ${S3_BUCKET_NAME}/${SUGGEST_FOLDER}/${imageKey}`,
    TopicArn: SNS_TOPIC_ARN,
  };
  try {
    const result = await sns.publish(params).promise();
    log.debug(`Result is ${JSON.stringify(result)}`);
  } catch (error) {
    log.error({ message: 'Failed to send a mail', data: error });
  }
};
