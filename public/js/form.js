const getName = () => {
    return localStorage.getItem("name");
};

const setName = (name) => {
    localStorage.setItem("name", name);
};

const nameInputs = document.getElementsByName("name");
const nameVal = getName();
for (const nameInput of nameInputs) {
    if (nameVal) nameInput.value = nameVal;
    nameInput.addEventListener("change", (e) => setName(e.target.value));
}

const validateImage = (file, input) => {
    const validFiles = ["image/png", "image/jpg", "image/jpeg"];
    if (validFiles.includes(file.type)) {
        input.setCustomValidity("");
        input.removeAttribute("aria-invalid");
        return true;
    } else {
        input.setCustomValidity("Please select a png or jpeg image file.");
        input.setAttribute("aria-invalid", true);
        return false;
    }
};

const clearImagePreview = (preview) => {
    if (preview.src) {
        URL.revokeObjectURL(preview.src);
    }

    preview.removeAttribute("src");
    preview.style.display = null;
};

const addImagePreview = (imageFile, preview) => {
    clearImagePreview(preview);

    const url = URL.createObjectURL(imageFile);
    preview.src = url;
    preview.style.display = "block";
};

const removeImage = (preview, input) => {
    return () => {
        clearImagePreview(preview);
        input.value = null;
    };
};

const pasteImage = (preview) => {
    return (e) => {
        for (const item of e.clipboardData.items) {
            if (item.kind === "file" && validateImage(item, e.target)) {
                const imageFile = item.getAsFile();
                addImagePreview(imageFile, preview);
            }
        }
    };
};

const uploadImage = (preview) => {
    return (e) => {
        const [file] = e.target.files;
        clearImagePreview(preview);
        if (file && validateImage(file, e.target)) {
            addImagePreview(file, preview);
        }
    };
};

const guessesPaste = document.getElementById("guesses-paste");
const guessesPreview = document.getElementById("guesses-preview");
const guessesUpload = document.getElementById("guesses-upload");
guessesPaste.addEventListener("paste", pasteImage(guessesPreview));
guessesPaste.addEventListener("blur", (e) => (e.target.value = null));
guessesUpload.addEventListener("change", uploadImage(guessesPreview));
guessesPreview.parentElement.addEventListener("click", removeImage(guessesPreview, guessesUpload));

const statsPaste = document.getElementById("stats-paste");
const statsPreview = document.getElementById("stats-preview");
const statsUpload = document.getElementById("stats-upload");
statsPaste.addEventListener("paste", pasteImage(statsPreview));
statsPaste.addEventListener("blur", (e) => (e.target.value = null));
statsUpload.addEventListener("change", uploadImage(statsPreview));
statsPreview.parentElement.addEventListener("click", removeImage(statsPreview, statsUpload));

const setFormControl = (form, disable = false, submitMessage = "Submit") => {
    for (const button of form.getElementsByTagName("button")) {
        if (button.type === "submit") {
            button.ariaBusy = disable;
            button.textContent = submitMessage;
        }
        button.disabled = disable;
    }

    for (const field of [
        ...form.getElementsByTagName("input"),
        ...form.getElementsByTagName("select"),
    ]) {
        field.disabled = disable;
    }
};

const clearFormErrors = () => {
    const formErrors = document.getElementById("form-errors");
    formErrors.innerHTML = null;
    formErrors.style.display = null;
};

const showFormErrors = (message, html = true) => {
    const formErrors = document.getElementById("form-errors");
    if (html) {
        formErrors.innerHTML = message;
    } else {
        const pre = document.createElement("pre");
        pre.textContent = message;
        formErrors.appendChild(pre);
    }

    formErrors.style.display = "block";
};

const submitForm = async (e) => {
    e.preventDefault();
    e.target.reportValidity();

    clearFormErrors();

    const data = new FormData(e.target);
    const score = data.get("score");
    if (e.target.id === "results-form") {
        const submitMessage =
            score === "0"
                ? "Don't worry kiddo, you'll get 'em next time."
                : score === "skip"
                ? "Skipping"
                : "Well done, I'm proud of you.";
        setFormControl(e.target, true, submitMessage);

        if (guessesPreview.src) {
            const guessesBlob = await fetch(guessesPreview.src).then((res) => res.blob());
            data.append("guesses", guessesBlob, "guesses.png");
        }

        if (statsPreview.src) {
            const statsBlob = await fetch(statsPreview.src).then((res) => res.blob());
            data.append("stats", statsBlob, "stats.png");
        }
    } else {
        setFormControl(e.target, true);
    }

    if (score === "skip") {
        data.set("score", 0);
        data.append("skipped", true);
    }

    data.set("date", new Date().toISOString().split("T")[0]);

    fetch("/submit", {
        method: "post",
        body: data,
    })
        .catch((err) => {
            showFormErrors(err.stack, false);
            throw err;
        })
        .then((res) => {
            if (res.ok) {
                window.location = res.url;
            } else {
                return res.text();
            }
        })
        .then((text) => {
            if (text) showFormErrors(text);
        })
        .finally(() => {
            setFormControl(e.target, false);
        });
};

document.getElementById("results-form").addEventListener("submit", submitForm);
document.getElementById("skip-form").addEventListener("submit", submitForm);

const toggleSkipModal = (e) => {
    const name = document.forms["results-form"].elements.name.selectedOptions[0];
    document.getElementById("selected-name").innerText = name.text;
    document.getElementById("hidden-name-input").value = name.value;
    toggleModal(e);
};

document.getElementById("skip-button").addEventListener("click", toggleSkipModal);
