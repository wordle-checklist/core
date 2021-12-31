const express = require("express");
const multer = require("multer");
const mime = require("mime-types");
const path = require("path");

const app = express();
app.use(express.static("public", { extensions: ["html"] }));

const storage = multer.diskStorage({
    destination: "img",
    filename: (req, file, cb) => {
        const date = new Date().toISOString().split("T")[0];
        const ext = mime.extension(file.mimetype);
        cb(null, `${date}_${file.fieldname}_${req.body.name}.${ext}`);
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
    res.redirect("results");
};

app.post("/submit", upload, addResult);

app.listen(5000, () => {
    console.log(`Listening on port 5000`);
});
