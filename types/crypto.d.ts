/**
 * Type definitions for crypto-js
 */

declare module 'crypto-js' {
  interface Static {
    lib: {
      WordArray: {
        random(nBytes: number): any;
        toString(): string;
      };
      Hex: {
        parse(hex: string): any;
      };
    };
    PBKDF2(password: string, salt: string, cfg?: {
      keySize: number;
      iterations: number;
    }): any;
    mode: {
      CBC: any;
    };
    pad: {
      Pkcs7: any;
    };
    enc: {
      Utf8: {
        parse(): any;
      };
      Hex: {
        parse(hex: string): any;
      };
    };
  }

  const enc: {
    Utf8: any;
    Hex: any;
  };

  const lib: typeof crypto-js['lib'];

  function PBKDF2(password: string, salt: string, cfg?: {
    keySize: number;
    iterations: number;
  }): any;
}

declare module 'crypto-js/aes' {
  import { CipherParams } from 'crypto-js';

  interface Static {
    encrypt(message: string, key: any, cfg?: CipherParams): any;
    decrypt(ciphertext: any, key: any, cfg?: CipherParams): any;
  }

  const AES: typeof cryptoJsAES.Static;
}

declare const cryptoJsAES: {
  Static: {
    encrypt(message: string, key: any, cfg?: any): any;
    decrypt(ciphertext: any, key: any, cfg?: any): any;
  };
};

declare module 'crypto-js/tripledes' {
  // Export if needed
}
