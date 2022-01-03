fetch("/api/results?type=html")
    .then((res) => res.text())
    .then((text) => {
        document.getElementsByTagName("main")[0].innerHTML = text;
    });
