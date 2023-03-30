require('dotenv').config({
    path: '../.env',
  });
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const { readFileSync } = require('fs');
  const email = readFileSync('./email.html');
  
  const REGION = 'us-east-1';
  
  const s3Client = new S3Client({
    region: REGION,
  });
  
  const main = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: '4m/latest.html',
            Body: email,
            ACL: 'public-read',
            ContentType: 'text/html',
          })
        );
        resolve(res);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  main()
    .then((res) => {
      console.log(`==> Uploaded FFFW Email `);
      console.log(
        `==> View here: https://assets.thedailyhearse.com/4m/latest.html?versionId=${res.VersionId}`
      );
    })
    .catch((error) => {
      console.error(error);
    });
  