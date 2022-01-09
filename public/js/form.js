const addImagePreview = (imageFile, preview) => {
    if (preview.src) {
        URL.revokeObjectURL(preview.src);
    }

    const url = URL.createObjectURL(imageFile);
    preview.src = url;
    preview.style.display = "block";
};

const pasteImage = (preview) => {
    return (e) => {
        for (const item of e.clipboardData.items) {
            if (item.type.includes("image")) {
                const imageFile = item.getAsFile();
                addImagePreview(imageFile, preview);
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

const uploadImage = (preview) => {
    return (e) => {
        const [file] = e.target.files;
        addImagePreview(file, preview);
    };
};

const guessesUpload = document.getElementById("guesses-upload");
guessesUpload.addEventListener("change", uploadImage(guessesPreview));

const statsUpload = document.getElementById("stats-upload");
statsUpload.addEventListener("change", uploadImage(statsPreview));

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

    if (data.get("score") === "skip") {
        data.set("score", 0);
        data.append("skipped", true);
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

const toggleSkipModal = (e) => {
    const name = document.forms["results-form"].elements.name.selectedOptions[0];
    document.getElementById("selected-name").innerText = name.text;
    document.getElementById("hidden-name-input").value = name.value;
    toggleModal(e);
};

document.getElementById("skip-button").addEventListener("click", toggleSkipModal);
