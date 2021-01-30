import { Body, BucketName, ObjectKey, PutObjectRequest } from 'aws-sdk/clients/s3';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import SendData = ManagedUpload.SendData;

const { S3_BUCKET_NAME } = process.env;
const s3 = new S3();

export const upload = async (byteImage: string, folderName: string): Promise<SendData> => {
  const withoutPrefix = byteImage.includes(',') ? byteImage.split(',')[1] : byteImage;
  const decodedImage: Body = Buffer.from(withoutPrefix, 'base64');
  const filePath: ObjectKey = `${folderName}/${uuid()}.jpeg`;
  const bucketName: BucketName = S3_BUCKET_NAME;
  const params: PutObjectRequest = {
    Body: decodedImage,
    Bucket: bucketName,
    Key: filePath,
    ContentType: 'image/jpeg',
  };
  return s3.upload(params).promise();
};
