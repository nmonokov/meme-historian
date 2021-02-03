import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { clientError, ok, serverError } from './responseUtils';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import SendData = ManagedUpload.SendData;
import { listByFolder, upload } from './s3/s3Bucket';
import * as log from 'loglevel';
import { LogLevelDesc } from 'loglevel';

const { LOG_LEVEL } = process.env;
log.setDefaultLevel(LOG_LEVEL as LogLevelDesc);

// TODO implement handler for max suggested memes possible.
// TODO implement image deletion
// TODO implement image move to another folder
// TODO make suggest folder logic. SES topic with Lambda triggered when image in suggest folder is uploaded.
// TODO Cognito user authentication: Admin role and user role. Notify when requesting registration.

/**
 * Uploads Base64 encoded image to S3 bucket selected in serverless.yml file.
 * @param event contains encoded image and folder name where image will ve stored on s3.
 */
export const uploadImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters.folderName) {
    const message = 'folder path parameter is missing.';
    log.error({ message });
    return clientError(message);
  }
  if (!event.body) {
    const message = 'Body can\'t be empty';
    log.error({ message });
    return clientError(message);
  }
  try {
    const imageData: SendData = await upload(JSON.parse(event.body).image, event.pathParameters.folderName);
    log.debug({ data: imageData });
    return ok(imageData.Key);
  } catch (error) {
    log.error({ message: error.message });
    return serverError(error.message);
  }
};

/**
 * Retrieves folder content as array of image urls.
 * @param event contains folder name to take images from
 */
export const getFolderContent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters.folderName) {
    const message = 'folder path parameter is missing.';
    log.error({ message });
    return clientError(message);
  }
  try {
    const images = await listByFolder(event.pathParameters.folderName);
    log.debug({ data: images });
    return ok(images);
  } catch (error) {
    log.error({ message: error.message });
    return serverError(error.message);
  }
};
