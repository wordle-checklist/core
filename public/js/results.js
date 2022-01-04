const getResults = (spoiler = false) => {
    const article = document.getElementById("main-article");
    article.ariaBusy = true;
    fetch(`/api/results?type=html&spoiler=${spoiler}`)
        .then((res) => res.text())
        .then((text) => {
            article.innerHTML = text;
            article.ariaBusy = false;
        });
};

getResults();
