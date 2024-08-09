import { createHmac, timingSafeEqual, randomBytes } from "crypto";

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
  let mergedArray = [...labels, ...existing_labels];
  let uniqueArray = [...new Set(mergedArray)];
  return { labels: uniqueArray };
}

export function platformStatus(platform, data) {
  const platformData = data.find((item) => item.platform === platform);
  return platformData ? platformData.isConnect : false;
}

export function isLabelsMismatch(newLabels, previousLabels) {
  if (
    Array.isArray(newLabels) &&
    Array.isArray(previousLabels) &&
    newLabels.length === previousLabels.length
  ) {
    for (let i = 0; i < newLabels.length; i++) {
      if (newLabels[i] !== previousLabels[i]) {
        return true;
      }
    }
    return false;
  } else {
    return true;
  }
}

export function getOutlookExpirationDateTime() {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 3);
  const updatedDateISOString = currentDate.toISOString();
  return updatedDateISOString;
}

export function findDuplicateStopWords(inputArray, existingArray) {
  const set1 = new Set(existingArray);
  const duplicates = inputArray.filter((item) => set1.has(item));
  const value = JSON.stringify(duplicates);
  return value;
}

export function findNotExistingStopWords(inputArray, existingArray) {
  const set1 = new Set(existingArray);
  const notExisting = inputArray.filter((item) => !set1.has(item));
  const value = JSON.stringify(notExisting);
  return value;
}

export function getRandomString() {
  const randomHexString = randomBytes(32).toString("hex");
  return randomHexString;
}

export function base64Decrypt(cipher, isObject) {
    if (!cipher) {
        return JSON.stringify({
            error: true,
            message: 'Cipher is missing',
        });
    }

    try {
        const decodedContent = !isObject ? atob(cipher) : JSON.parse(atob(cipher));
        const cleanedContent = decodedContent.replace(/\r/g, '');
        return JSON.stringify({
            error: false,
            content: cleanedContent
        });
    } catch (err) {
        return JSON.stringify({
            error: true,
            message: 'Base64 Decryption Failed',
        });
    }
}

export function base64Encrypt(content) {
    if (!content) {
        return {
            error: true,
            message: 'Content is missing',
        }
    }

    try {
        return JSON.stringify({
            error: false,
            cipher: btoa(typeof content === 'string' ? content : JSON.stringify(content))
        });
    } catch (err) {
        return JSON.stringify({
            error: true,
            message: 'Base64 Encryption Failed',
        });
    }
}

