import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { clientError, noContent, ok, serverError } from './responseUtils';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import SendData = ManagedUpload.SendData;
import { listByFolder, upload, foldersList, del, copy } from './bucket';
import * as log from 'loglevel';
import { LogLevelDesc } from 'loglevel';
import { notifyAdmin } from './sns';

const { LOG_LEVEL, SUGGEST_FOLDER } = process.env;
log.setDefaultLevel(LOG_LEVEL as LogLevelDesc);

// TODO Cognito user authentication: Admin role and user role. Notify when requesting registration.

/**
 * Uploads Base64 encoded image to S3 bucket selected in serverless.yml file.
 * @param event contains encoded image and folder name where image will ve stored on s3.
 */
export const uploadImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    const message = 'Body can\'t be empty';
    log.error({ message });
    return clientError(message);
  }

  const byteImage = JSON.parse(event.body).image;
  if (!byteImage) {
    const message = 'You should specify "image" property.';
    log.error({ message });
    return clientError(message);
  }

  try {
    const folderName = event.pathParameters.folderName;
    const imageData: SendData = await upload(byteImage, folderName);

    if (SUGGEST_FOLDER === folderName) {
      await notifyAdmin(imageData.Key);
    }

    return ok(imageData.Key);
  } catch (error) {
    log.error({ message: error.message });
    return serverError(error.message);
  }
};

/**
 * Permanently deletes image from S3 bucket. folderName and imageId(a.k.a. imageKey) are needed for deletion.
 * FolderName is just for REST consistency.
 * @param event contains folder name and image id.
 */
export const deleteImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    await del(event.pathParameters.folderName, event.pathParameters.imageId);
    return noContent();
  } catch (error) {
    log.error({ message: error.message });
    return serverError(error.message);
  }
};

/**
 * Move image from one folder to another.
 * @param event contains folder name and image id.
 */
export const moveImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    const message = 'Body can\'t be empty';
    log.error({ message });
    return clientError(message);
  }

  const destinationFolder = JSON.parse(event.body).destinationFolder;
  if (!destinationFolder) {
    const message = 'You should specify "destinationFolder" property.';
    log.error({ message });
    return clientError(message);
  }

  try {
    await copy(event.pathParameters.folderName, event.pathParameters.imageId, destinationFolder);
    await del(event.pathParameters.folderName, event.pathParameters.imageId);
    return noContent();
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
  const continuationToken = event?.queryStringParameters?.token;
  try {
    const images = await listByFolder(event.pathParameters.folderName, continuationToken);
    log.debug({ data: images });
    return ok(images);
  } catch (error) {
    log.error({ message: error.message });
    return serverError(error.message);
  }
};

/**
 * Return all folders present in the S3 bucket with the default one.
 */
export const folders = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const continuationToken = event?.queryStringParameters?.token;
  try {
    const folders = await foldersList(continuationToken);
    log.debug({ data: folders });
    return ok(folders);
  } catch (error) {
    log.error({ message: error.message });
    return serverError(error.message);
  }
};
