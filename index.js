require("dotenv").config();

const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const fs = require("fs/promises");
const aws = require("aws-sdk");

const s3 = new aws.S3();

const today = () => {
    return new Date().toISOString().split("T")[0];
};

const app = express();
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

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

const addResult = (req, res) => {
    console.log(req.body);
    console.log(req.files);
    const dirPath = path.join("static", "results", today());
    const { name, score } = req.body;
    const { guesses, stats } = req.files;
    const guessesFilename = guesses ? guesses[0].key : "";
    const statsFilename = stats ? stats[0].key : "";
    const content = [name, score, guessesFilename, statsFilename].join(",");
    fs.mkdir(dirPath, { recursive: true })
        .then(() => fs.writeFile(path.join(dirPath, req.body.name), content))
        .then(() => res.redirect("results"));
};

app.post("/submit", upload, addResult);

app.listen(5000, () => {
    console.log(`Listening on port 5000`);
});
