import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const outFile = resolve("dist/qentrah-auth.js");

const source = `(() => {
  const DEFAULT_START_PATH = "/api/qentrah/oauth/start";

  function mountAuthorizeButton(options) {
    const element = document.getElementById(options.buttonId);
    if (!element) {
      const error = new Error('Qentrah authorize button "' + options.buttonId + '" was not found.');
      if (typeof options.onError === "function") options.onError(error);
      return { mounted: false, destroy: function destroy() {} };
    }

    const startUrl = options.startUrl || DEFAULT_START_PATH;
    if (options.label) element.textContent = options.label;
    element.setAttribute("data-qentrah-authorize", "true");

    function onClick(event) {
      event.preventDefault();
      if (element instanceof HTMLButtonElement && options.disabledLabel) {
        element.disabled = true;
        element.textContent = options.disabledLabel;
      }
      window.location.assign(startUrl);
    }

    element.addEventListener("click", onClick);
    return {
      mounted: true,
      element: element,
      destroy: function destroy() {
        element.removeEventListener("click", onClick);
      }
    };
  }

  window.QentrahAuth = Object.assign({}, window.QentrahAuth, {
    mountAuthorizeButton: mountAuthorizeButton,
    mountQentrahAuthorizeButton: mountAuthorizeButton
  });
})();`;

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, `${source}\n`);
