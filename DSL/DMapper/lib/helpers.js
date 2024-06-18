import { createHmac,timingSafeEqual } from "crypto";

export function verifySignature(payload, headers) {
    const signature = headers['x-hub-signature'];
    const SHARED_SECRET = 'wNc6HjKGu3RZXYNXqMTh';
    const hmac = createHmac('sha256', Buffer.from(SHARED_SECRET, 'utf8'));
    const payloadString = JSON.stringify(payload);
    hmac.update(Buffer.from(payloadString, 'utf8'));
    const computedSignature = hmac.digest('hex');
    const computedSignaturePrefixed = "sha256=" + computedSignature;
    const isValid = timingSafeEqual(Buffer.from(computedSignaturePrefixed, 'utf8'), Buffer.from(signature, 'utf8'));
    return isValid;
}

export function getAuthHeader(username, token) {
  const auth = `${username}:${token}`;
  const encodedAuth = Buffer.from(auth).toString("base64");
  return `Basic ${encodedAuth}`;
}
