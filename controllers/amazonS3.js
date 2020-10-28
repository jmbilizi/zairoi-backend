const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const path = require("path");

//store file to s3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  Bucket: process.env.AWS_BUCKET_NAME,
});

//Single Upload
exports.fileUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // In bytes:  20 MB
  //check file type
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file");

// Multiple File Uploads ( max 4 )
exports.filesUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        path.basename(file.originalname, path.extname(file.originalname)) +
          "-" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  }),
  limits: { fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("files", 4);

//check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|mp3|pdf|mp4|3gp|mov/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  //	const mimetype = filetypes.test( file.mimetype );
  if (extname) {
    return cb(null, true);
  } else {
    cb("Error: Invalid File!" + extname);
  }
}

//get file type
exports.getFileType = (ext) => {
  let type = null;
  switch (ext) {
    case (ext.match(/jpeg|jpg|png|gif/) || {}).input:
      type = "image";
      break;
    case (ext.match(/mp4|3gp|mov|flv/) || {}).input:
      type = "video";
      break;
    case (ext.match(/mp3/) || {}).input:
      type = "audio";
      break;
    case (ext.match(/pdf/) || {}).input:
      type = "pdf";
      break;
    default:
      break;
  }
  return type;
};
