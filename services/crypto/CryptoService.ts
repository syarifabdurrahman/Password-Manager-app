/**
 * CryptoService
 * Provides AES encryption/decryption for backup files
 */

import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';

export interface EncryptedBackup {
  data: string;      // Base64 encrypted data
  iv: string;        // Initialization vector
  salt: string;      // Salt for key derivation
  version: string;    // Encryption version
}

/**
 * Generates a random hex string (JavaScript-based, no native crypto required)
 * @param bytes - Number of bytes to generate
 * @returns Random hex string
 */
const generateRandomHex = (bytes: number): string => {
  const array = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Encrypts backup data using AES encryption with password-based key derivation
 * @param data - The JSON string to encrypt
 * @param password - The encryption password
 * @returns Encrypted backup object with IV and salt
 */
export const encryptBackup = (data: string, password: string): EncryptedBackup => {
  // Generate random salt (16 bytes = 32 hex chars)
  const salt = generateRandomHex(16);

  // Derive key from password using PBKDF2
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });

  // Generate random IV (16 bytes = 32 hex chars)
  const iv = generateRandomHex(16);

  // Encrypt the data
  const encrypted = AES.encrypt(data, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    data: encrypted.toString(),
    iv: iv,
    salt: salt,
    version: '1.0',
  };
};

/**
 * Decrypts backup data using AES encryption
 * @param encryptedBackup - The encrypted backup object
 * @param password - The decryption password
 * @returns Decrypted JSON string
 * @throws Error if password is incorrect or data is corrupted
 */
export const decryptBackup = (encryptedBackup: EncryptedBackup, password: string): string => {
  try {
    // Derive key from password using stored salt
    const key = CryptoJS.PBKDF2(password, encryptedBackup.salt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    // Decrypt the data
    const decrypted = AES.decrypt(encryptedBackup.data, key, {
      iv: CryptoJS.enc.Hex.parse(encryptedBackup.iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedStr || decryptedStr === '') {
      throw new Error('Decryption failed - invalid password or corrupted data');
    }

    return decryptedStr;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt backup. Please check your password.');
  }
};

/**
 * Validates if a password can decrypt the backup
 * @param encryptedBackup - The encrypted backup object
 * @param password - The password to validate
 * @returns true if password is correct
 */
export const validateBackupPassword = (
  encryptedBackup: EncryptedBackup,
  password: string
): boolean => {
  try {
    decryptBackup(encryptedBackup, password);
    return true;
  } catch {
    return false;
  }
};
