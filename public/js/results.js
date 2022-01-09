const getResults = (spoiler = false) => {
    const article = document.getElementById("main-article");
    article.ariaBusy = true;

    const date = new Date().toISOString().split("T")[0];
    fetch(`/api/results/${date}?type=html&spoiler=${spoiler}`)
        .then((res) => res.text())
        .then((text) => {
            article.innerHTML = text;
            article.ariaBusy = false;
        });
};

getResults();
