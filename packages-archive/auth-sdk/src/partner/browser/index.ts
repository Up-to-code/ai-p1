import { DEFAULT_QENTRAH_PARTNER_START_PATH } from "../core.js";

export type MountQentrahAuthorizeButtonOptions = {
  buttonId: string;
  startUrl?: string;
  label?: string;
  disabledLabel?: string;
  onError?: (error: Error) => void;
};

export function mountQentrahAuthorizeButton(options: MountQentrahAuthorizeButtonOptions) {
  const element = document.getElementById(options.buttonId);
  if (!element) {
    const error = new Error(`Qentrah authorize button "${options.buttonId}" was not found.`);
    options.onError?.(error);
    return { mounted: false as const, destroy: () => undefined };
  }

  const startUrl = options.startUrl ?? DEFAULT_QENTRAH_PARTNER_START_PATH;
  if (options.label) element.textContent = options.label;
  element.setAttribute("data-qentrah-authorize", "true");

  const onClick = (event: Event) => {
    event.preventDefault();
    if (element instanceof HTMLButtonElement && options.disabledLabel) {
      element.disabled = true;
      element.textContent = options.disabledLabel;
    }
    window.location.assign(startUrl);
  };

  element.addEventListener("click", onClick);
  return {
    mounted: true as const,
    element,
    destroy() {
      element.removeEventListener("click", onClick);
    },
  };
}
