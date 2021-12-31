const pasteImage = (preview) => {
    return (e) => {
        for (const item of e.clipboardData.items) {
            if (item.type.includes("image")) {
                const data = item.getAsFile();

                if (preview.src) {
                    URL.revokeObjectURL(preview.src);
                }

                const url = URL.createObjectURL(data);
                preview.src = url;
                preview.style.display = "block";
            }
        }
    };
};

const guessesPaste = document.getElementById("guesses-paste");
const guessesPreview = document.getElementById("guesses-preview");
guessesPaste.addEventListener("paste", pasteImage(guessesPreview));

const statsPaste = document.getElementById("stats-paste");
const statsPreview = document.getElementById("stats-preview");
statsPaste.addEventListener("paste", pasteImage(statsPreview));

const submitForm = async (e) => {
    e.preventDefault();

    const formErrors = document.getElementById("form-errors");
    formErrors.innerHTML = null;

    const data = new FormData(e.target);
    if (guessesPreview.src) {
        const guessesBlob = await fetch(guessesPreview.src).then((res) => res.blob());
        data.append("guesses", guessesBlob, "guesses.png");
    }

    if (statsPreview.src) {
        const statsBlob = await fetch(statsPreview.src).then((res) => res.blob());
        data.append("stats", statsBlob, "stats.png");
    }

    fetch("/submit", {
        method: "post",
        body: data,
    })
        .then((res) => {
            if (res.ok) {
                window.location = res.url;
            } else {
                return res.text();
            }
        })
        .then((text) => {
            formErrors.innerHTML = text;
        });
};

document.getElementById("results-form").addEventListener("submit", submitForm);
