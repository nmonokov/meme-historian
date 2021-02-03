import {
  Body,
  BucketName,
  CommonPrefix,
  ListObjectsV2Request,
  ObjectKey,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';
import SendData = ManagedUpload.SendData;
import { ImageData } from '../model';
import * as log from 'loglevel';

const { S3_BUCKET_NAME, DEFAULT_FOLDER } = process.env;
const bucketName: BucketName = S3_BUCKET_NAME;
const s3 = new S3();

// TODO make human readable folder name
// TODO list of folders. Use listObjectsV2 with Delimeter: '/' with pagination and with default folder
// TODO add pagination to images

/**
 * Decrypts byte image into stream and stores to s3 bucket with selected prefix as folder
 *
 * @param byteImage image to store
 * @param folderName prefix in s3 bucket
 */
export const upload = async (byteImage: string, folderName: string): Promise<SendData> => {
  const withoutPrefix = byteImage.includes(',') ? byteImage.split(',')[1] : byteImage;
  const decodedImage: Body = Buffer.from(withoutPrefix, 'base64');
  const filePath: ObjectKey = `${folderName}/${uuid()}.jpeg`;
  const params: PutObjectRequest = {
    Body: decodedImage,
    Bucket: bucketName,
    Key: filePath,
    ContentType: 'image/jpeg',
  };
  log.info({
    message: 'Params to save image to S3 bucket.',
    params,
  });
  return s3.upload(params).promise();
};

const toImageData = (data: S3.Object): ImageData => {
  return ({
    id: data.Key,
    uploadDate: data.LastModified?.toISOString(),
  });
};

/**
 * Lists all stored images by s3 prefix. Transform received data into {@link ImageData} with signed url
 * for easier access from the front end application.
 *
 * @param folderName of images to return
 */
export const listByFolder = async (folderName: string): Promise<ImageData[]> => {
  const params: ListObjectsV2Request = {
    Bucket: bucketName,
    Prefix: folderName,
  };
  log.info({
    message: 'Params to get images from S3 bucket.',
    params,
  });
  const rawImageList = await s3.listObjectsV2(params).promise();
  return rawImageList.Contents
      ?.map((data: S3.Object) => toImageData(data))
      .sort((data1: ImageData, data2: ImageData) => data1.uploadDate > data2.uploadDate ? -1 : 1);
};

/**
 * Lists all folders in the S3 bucket lowercased with underscores. Front end will prettify those folders
 * to a human-readable manner.
 * Adds default folder which will be always present. This folder will contain uncategorized images.
 * Empty folders are not possible due to nature of "folders" in the AWS S3 buckets except for a default one.
 */
export const foldersList = async (): Promise<string[]> => {
  const params: ListObjectsV2Request = {
    Bucket: bucketName,
    Delimiter: '/',
  };
  log.info({
    message: 'Params to get folders from S3 bucket.',
    params,
  });

  const rawFolders = await s3.listObjectsV2(params).promise();
  const folders: string[] = rawFolders?.CommonPrefixes
      .map((data: CommonPrefix) => data.Prefix.replace('/', ''));
  // TODO Move default folder logic to front end. Here we'll filter out default folder.
  if (!folders.includes(DEFAULT_FOLDER)) {
    log.info(`Using '${DEFAULT_FOLDER}' folder.`);
    folders.unshift(DEFAULT_FOLDER);
  }
  log.info({
    message: 'List of folders',
    folders,
  });
  return folders;
};
