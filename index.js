require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const boolParser = require("express-query-boolean");

const upload = require("./storage");
const { NAMES, NAVIGABLE_PAGES } = require("./settings");

const port = process.env.PORT || 5000;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const addResult = (req, res) => {
    console.log(req.body);
    const { name, score, skipped = false } = req.body;
    const { guesses, stats } = req.files;
    const guessesUrl = guesses ? guesses[0].location : null;
    const statsUrl = stats ? stats[0].location : null;

    const insert =
        "INSERT INTO results(name, score, guesses, stats, skipped) VALUES($1, $2, $3, $4, $5) " +
        "ON CONFLICT ON CONSTRAINT name_date_unique DO UPDATE SET " +
        "score = EXCLUDED.score, " +
        "guesses = COALESCE(EXCLUDED.guesses, results.guesses), " +
        "stats = COALESCE(EXCLUDED.stats, results.stats)," +
        "skipped = COALESCE(EXCLUDED.skipped, results.skipped);";
    const values = [name, score, guessesUrl, statsUrl, skipped];
    pool.query(insert, values).then(() => res.redirect("results"));
};

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(boolParser());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render(path.join("pages", "index"), { names: NAMES, pages: NAVIGABLE_PAGES });
});
app.get("/results", (req, res) => {
    res.render(path.join("pages", "results"), { pages: NAVIGABLE_PAGES });
});
app.get("/api/results/:date", (req, res) => {
    const select = `SELECT * FROM results WHERE DATE=${`'${req.params.date}'` || "CURRENT_DATE"}`;
    pool.query(select).then((data) => {
        let results = NAMES.reduce((acc, curr) => ({ [curr]: null, ...acc }), {});
        for (const row of data.rows) {
            results[row.name] = row;
        }

        switch (req.query.type) {
            case "html":
                res.render(path.join("partials", "resultsList"), {
                    results,
                    spoiler: req.query.spoiler === true,
                });
                break;
            case "json":
            default:
                res.json(results);
        }
    });
});
app.get("/submit", (req, res) => {
    res.redirect("results");
});
app.post("/submit", upload, addResult);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
