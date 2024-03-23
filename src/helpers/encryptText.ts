import * as crypto from "crypto";

const passphrase = "cryptoParaphrase";
const key = crypto.createHash("sha256").update(passphrase).digest();
const iv = Buffer.from("YourConstantIV12");

export function encryptText(text: string) {
  try {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedData = cipher.update(text, "utf8", "base64");
    encryptedData += cipher.final("base64");

    console.log("Encrypted:", encryptedData);
    return encryptedData;
  } catch (error) {
    console.log(`error encrypting data`, error);
  }
}

export function decryptText(text: string) {
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decryptedData = decipher.update(text, "base64", "utf8");
    decryptedData += decipher.final("utf8");

    console.log("Decrypted:", decryptedData);
    return decryptedData;
  } catch (error) {
    console.log(`error decrypting data`, error);
    return null;
  }
}
