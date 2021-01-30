import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { clientError, ok } from './responseUtils';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import SendData = ManagedUpload.SendData;
import { upload } from './s3/s3Upload';


export const uploadImage = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.pathParameters || !event.pathParameters.folderName) {
    return clientError('folder path parameter is missing.');
  }
  if (!event.body) {
    return clientError('Body can\'t be empty');
  }
  const imageData: SendData = await upload(JSON.parse(event.body).image, event.pathParameters.folderName);
  return ok(imageData.Key);
};
