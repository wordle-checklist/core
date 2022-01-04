(() => {
    class SchemeController {
        _scheme = "auto";

        constructor(target) {
            this.target = target || document.getElementsByTagName("html")[0];
            this.scheme = "auto";
        }

        get preferredScheme() {
            return (
                localStorage.getItem("scheme") ||
                (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            );
        }

        get switches() {
            return document.getElementsByClassName("scheme-switch");
        }

        get scheme() {
            return this._scheme;
        }

        set scheme(val) {
            if (val === "auto") {
                this._scheme = this.preferredScheme;
            } else {
                this._scheme = val;
            }

            localStorage.setItem("scheme", this.scheme);

            for (const sw of this.switches) {
                this.updateSwitch(sw);
            }

            this.target.setAttribute("data-theme", this.scheme);
        }

        updateSwitch(sw) {
            sw.checked = this.scheme === "dark";
        }

        addSwitch(parent, inList = false) {
            const label = document.createElement("label");
            label.innerText = "Dark Mode: ";
            label.for = "dark mode";

            const sw = document.createElement("input");
            sw.type = "checkbox";
            sw.setAttribute("role", "switch");
            sw.name = "dark mode";
            sw.className = "scheme-switch";
            sw.addEventListener("change", () =>
                this.scheme === "dark" ? (this.scheme = "light") : (this.scheme = "dark")
            );
            this.updateSwitch(sw);
            label.appendChild(sw);

            if (inList) {
                const li = document.createElement("li");
                li.appendChild(label);
                parent.appendChild(li);
            } else {
                parent.appendChild(label);
            }
        }
    }

    const sc = new SchemeController();
    sc.addSwitch(document.getElementById("nav-theme"), true);
})();
