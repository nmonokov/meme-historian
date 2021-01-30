import { APIGatewayProxyResult } from 'aws-lambda';

export const ok = async (body: string): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body,
  };
};

export const clientError = async (body: string): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 400,
    body,
  };
};

export const serverError = async (body: string): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 500,
    body,
  };
};
