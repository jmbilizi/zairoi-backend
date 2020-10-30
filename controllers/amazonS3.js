const aws = require("aws-sdk");
require("dotenv").config();

//store file to s3
exports.s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// //get file type
// exports.getFileType = (ext) => {
//   let type = null;
//   switch (ext) {
//     case (ext.match(/jpeg|jpg|png|gif/) || {}).input:
//       type = "image";
//       break;
//     case (ext.match(/mp4|3gp|mov|flv/) || {}).input:
//       type = "video";
//       break;
//     case (ext.match(/mp3/) || {}).input:
//       type = "audio";
//       break;
//     case (ext.match(/pdf/) || {}).input:
//       type = "pdf";
//       break;
//     default:
//       break;
//   }
//   return type;
// };
