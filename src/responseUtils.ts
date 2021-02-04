import { APIGatewayProxyResult } from 'aws-lambda';

export const ok = async (data?: unknown): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: data,
    }),
  };
};

export const noContent = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 204,
    body: undefined,
  };
};

export const clientError = async (body: string): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: body,
    }),
  };
};

export const serverError = async (body: string, data?: unknown): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: body,
      data: data,
    }),
  };
};
