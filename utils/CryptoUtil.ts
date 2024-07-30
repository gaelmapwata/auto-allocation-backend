import CryptoJS from 'crypto-js';

export default {
  decrypt(text: string): string {
    const bytes = CryptoJS.AES.decrypt(text, process.env.CRYPTO_PRIVATE_KEY as string);
    return bytes.toString(CryptoJS.enc.Utf8);
  },
};
