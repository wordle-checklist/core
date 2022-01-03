require("dotenv").config();

const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const fs = require("fs/promises");
const aws = require("aws-sdk");
const { Pool } = require("pg");

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

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const addResult = (req, res) => {
    const { name, score } = req.body;
    const { guesses, stats } = req.files;
    const guessesUrl = guesses ? guesses[0].location : null;
    const statsUrl = stats ? stats[0].location : null;

    const insert =
        "INSERT INTO results(name, score, guesses, stats) VALUES($1, $2, $3, $4) " +
        "ON CONFLICT ON CONSTRAINT name_date_unique DO UPDATE SET " +
        "score = EXCLUDED.score, " +
        "guesses = COALESCE(EXCLUDED.guesses, results.guesses), " +
        "stats = COALESCE(EXCLUDED.stats, results.stats);";
    const values = [name, score, guessesUrl, statsUrl];
    pool.query(insert, values).then(() => res.redirect("results"));
};

app.post("/submit", upload, addResult);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
