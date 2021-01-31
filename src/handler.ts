import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { clientError, ok, serverError } from './responseUtils';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import SendData = ManagedUpload.SendData;
import { listByFolder, upload } from './s3/s3Bucket';

/**
 * Uploads Base64 encoded image to S3 bucket selected in serverless.yml file.
 * @param event contains encoded image and folder name where image will ve stored on s3.
 */
export const uploadImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters.folderName) {
    return clientError('folder path parameter is missing.');
  }
  if (!event.body) {
    return clientError('Body can\'t be empty');
  }
  try {
    const imageData: SendData = await upload(JSON.parse(event.body).image, event.pathParameters.folderName);
    return ok(imageData.Key);
  } catch (error) {
    return serverError(error.message);
  }
};

/**
 * Retrieves folder content as array of image urls.
 * @param event contains folder name to take images from
 */
export const getFolderContent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters.folderName) {
    return clientError('folder path parameter is missing.');
  }
  try {
    const images = await listByFolder(event.pathParameters.folderName);
    return ok(images);
  } catch (error) {
    return serverError(error.message);
  }
};
