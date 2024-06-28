import { createHmac, timingSafeEqual } from "crypto";

export function verifySignature(payload, headers, secret) {
  const signature = headers["x-hub-signature"];
  const SHARED_SECRET = secret;
  const hmac = createHmac("sha256", Buffer.from(SHARED_SECRET, "utf8"));
  const payloadString = JSON.stringify(payload);
  hmac.update(Buffer.from(payloadString, "utf8"));
  const computedSignature = hmac.digest("hex");
  const computedSignaturePrefixed = "sha256=" + computedSignature;
  const isValid = timingSafeEqual(
    Buffer.from(computedSignaturePrefixed, "utf8"),
    Buffer.from(signature, "utf8")
  );
  return isValid;
}

export function getAuthHeader(username, token) {
  const auth = `${username}:${token}`;
  const encodedAuth = Buffer.from(auth).toString("base64");
  return `Basic ${encodedAuth}`;
}

export function mergeLabelData(labels, existing_labels) {
  // Merge the arrays
  let mergedArray = [...labels, ...existing_labels];

  // Remove duplicates
  let uniqueArray = [...new Set(mergedArray)];

  // Return as JSON object
  return { labels: uniqueArray };
}
