const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const today = () => {
    return new Date().toISOString().split("T")[0];
};

const s3 = new aws.S3();
const storage = multerS3({
    s3: s3,
    bucket: "wordle-checklist",
    key: (req, file, cb) => {
        cb(null, `${today()}/${file.fieldname}_${req.body.name}`);
    },
    contentType: (req, file, cb) => {
        cb(null, file.mimetype);
    },
});

const limits = {
    files: 2,
    fileSize: 100 * 1024 * 1024, // 100MB
};

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
        return cb(new Error("Uploads must be jpg, jpeg, or png format."));
    }
};

const upload = multer({ storage, limits, fileFilter }).fields([
    { name: "guesses", maxCount: 1 },
    { name: "stats", maxCount: 1 },
]);

module.exports = upload;
