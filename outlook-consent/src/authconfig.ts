// authConfig.js
export const msalConfig = {
  auth: {
      clientId: "7063e01a-96cd-46a9-ab98-7d6b36843227",
      authority: "https://login.microsoftonline.com/common",
      redirectUri: "http://localhost:3003/callback",
  },
  scopes: ["User.Read", "offline_access"], // Add offline_access to get refresh token
};
