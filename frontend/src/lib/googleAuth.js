export const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const isGoogleAuthEnabled = Boolean(
  rawGoogleClientId &&
  rawGoogleClientId !== "gdg-on-campus-client-id" &&
  !rawGoogleClientId.startsWith("your-") &&
  rawGoogleClientId.includes(".apps.googleusercontent.com")
);

export const googleClientId = isGoogleAuthEnabled ? rawGoogleClientId : "";
