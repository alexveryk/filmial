const GOOGLE_SCRIPT_ID = "google-identity-services";

const loadGoogleIdentityServices = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), {
        once: true,
      });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () =>
      reject(new Error("Не вдалося завантажити Google Identity Services"));
    document.head.appendChild(script);
  });

export const decodeGoogleCredential = (credential) => {
  try {
    const payload = credential.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalizedPayload)
        .split("")
        .map(
          (character) =>
            `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`
        )
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const initializeGoogleAuth = async (clientId, callback) => {
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID не налаштовано");
  }

  const google = await loadGoogleIdentityServices();
  return google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: "openid email profile",
    callback,
  });
};

export const renderGoogleButton = (element, options = {}) => {
  if (!element || !window.google?.accounts?.id) return;

  window.google.accounts.id.renderButton(element, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "pill",
    ...options,
  });
};

export const signOutFromGoogle = () => {
  window.google?.accounts?.id?.disableAutoSelect();
};
