const express = require("express");
const multer = require("multer");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");

const today = () => {
    return new Date().toISOString().split("T")[0];
};

const app = express();
app.use(express.static("public", { extensions: ["html"] }));

const storage = multer.diskStorage({
    destination: "img",
    filename: (req, file, cb) => {
        const ext = mime.extension(file.mimetype);
        cb(null, `${today()}_${file.fieldname}_${req.body.name}.${ext}`);
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
    const filename = `${today()}_results_${req.body.name}`;
    const { name, score } = req.body;
    const { guesses, stats } = req.files;
    const guessesFilename = guesses ? guesses[0].filename : "";
    const statsFilename = stats ? stats[0].filename : "";
    const csv = [name, score, guessesFilename, statsFilename].join(",");
    fs.writeFileSync(`results/${filename}`, csv);

    res.redirect("results");
};

app.post("/submit", upload, addResult);

app.listen(5000, () => {
    console.log(`Listening on port 5000`);
});
