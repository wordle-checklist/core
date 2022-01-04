fetch("/api/results?type=html")
    .then((res) => res.text())
    .then((text) => {
        const article = document.getElementById("main-article");
        article.innerHTML = text;
        article.ariaBusy = false;
    });
