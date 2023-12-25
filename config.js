import 'dotenv/config';
import { SESClient } from '@aws-sdk/client-ses';
import { S3Client } from '@aws-sdk/client-s3';

// export const CLIENT_URL = 'http://localhost:3000';

export const awsConfig = {
    region: 'ap-southeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    apiVersion: '2011-12-05',
};

// export const awsConfig = {
//     region: 'ap-southeast-2',
//     credentials: {
//         accessKeyId: AWS_ACCESS_KEY_ID,
//         secretAccessKey: AWS_SECRET_ACCESS_KEY,
//     },
//     apiVersion: '2011-12-05',
// };

export const AWSSES = new SESClient(awsConfig);
export const AWSS3 = new S3Client(awsConfig);
