require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const upload = require("./storage");

const port = process.env.PORT || 5000;
const names = ["Arun", "Bread", "Dan", "Mannu", "Rhi", "Sam", "Steve", "Tom"];

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

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render(path.join("pages", "index"), { names });
});
app.get("/results", (req, res) => {
    res.render(path.join("pages", "results"));
});
app.post("/submit", upload, addResult);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
