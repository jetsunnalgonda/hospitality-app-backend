import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function uploadAvatarsToS3(avatarFiles) {
  const avatars = [];
  for (const file of avatarFiles) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const imageKey = `avatars/${uniqueSuffix}-${file.originalname}`
      const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: imageKey, // Unique filename
          Body: file.buffer,
          // ContentType: file.mimetype,
      };

      try {
          const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
          // Add the S3 URL to the avatars array
          // avatars.push({ url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}` }); // URL of the uploaded file
          avatars.push({ url: imageKey })
      } catch (error) {
          console.error('Error uploading file to S3:', error);
          throw new Error('Error uploading file to S3');
      }
  }
  return avatars;
}

export async function generatePresignedUrl(req, res) {
  try {
      const { imageKey } = req.query; // or req.params, depending on your route
      const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: imageKey,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
      res.json({ url });
  } catch (error) {
      console.error('Error generating pre-signed URL', error);
      res.status(500).json({ error: 'Unable to generate URL' });
  }
}
// export async function uploadAvatarsToS3(avatarFiles) {
//   const avatars = [];
//   for (const file of avatarFiles) {
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//       const uploadParams = {
//           Bucket: process.env.S3_BUCKET_NAME,
//           Key: `avatars/${uniqueSuffix}-${file.originalname}`, // Unique filename
//           Body: file.buffer,
//           ContentType: file.mimetype,
//       };

//       try {
//           await s3Client.send(new PutObjectCommand(uploadParams));
          
//           // Generate a pre-signed URL
//           const getObjectParams = {
//               Bucket: process.env.S3_BUCKET_NAME,
//               Key: uploadParams.Key,
//               Expires: 60 * 60, // URL expiry time in seconds (1 hour)
//           };

//           const command = new GetObjectCommand(getObjectParams);
//           const url = await s3Client.getSignedUrl(command);

//           avatars.push({ url: url }); // URL of the uploaded file
//       } catch (error) {
//           console.error('Error uploading file to S3:', error);
//           throw new Error('Error uploading file to S3');
//       }
//   }
//   return avatars;
// }



// import AWS from 'aws-sdk';

// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION,
// });

// const s3 = new AWS.S3();

// export async function uploadAvatarsToS3(avatarFiles) {
//     const avatars = [];
//     for (const file of avatarFiles) {
//         const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
//         const uploadParams = {
//             Bucket: process.env.S3_BUCKET_NAME,
//             Key: `avatars/${uniqueSuffix}-${file.originalname}`, // Unique filename
//             Body: file.buffer,
//             ContentType: file.mimetype,
//         };

//         const uploadResult = await s3.upload(uploadParams).promise();
//         avatars.push({ url: uploadResult.Location }); // URL of the uploaded file
//     }
//     return avatars;
// }
