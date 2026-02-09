/**
 * Password Generator Service
 * Implements IPasswordGeneratorService interface
 * Follows Single Responsibility Principle - only handles password generation
 */

import type {
  IPasswordGeneratorService,
  PasswordGenerationOptions,
  PasswordStrength,
} from '@/types';

// Character sets for password generation
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?`~',
} as const;

/**
 * Password entropy calculation constants
 */
const ENTROPY_CONSTANTS = {
  // Pool sizes for different character types
  poolSizes: {
    lowercase: 26,
    uppercase: 26,
    numbers: 10,
    symbols: 32,
  },
  // Strength thresholds (in bits of entropy)
  strength: {
    weak: 28,
    fair: 36,
    good: 60,
    strong: 80,
  },
} as const;

/**
 * Password Generator Service Implementation
 */
export class PasswordGeneratorService implements IPasswordGeneratorService {
  /**
   * Generate a random password based on options
   */
  generate(options: PasswordGenerationOptions): string {
    const {
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
    } = options;

    // Build character pool based on options
    let charPool = '';
    const requiredChars: string[] = [];

    if (includeLowercase) {
      charPool += CHAR_SETS.lowercase;
      requiredChars.push(this.getRandomChar(CHAR_SETS.lowercase));
    }
    if (includeUppercase) {
      charPool += CHAR_SETS.uppercase;
      requiredChars.push(this.getRandomChar(CHAR_SETS.uppercase));
    }
    if (includeNumbers) {
      charPool += CHAR_SETS.numbers;
      requiredChars.push(this.getRandomChar(CHAR_SETS.numbers));
    }
    if (includeSymbols) {
      charPool += CHAR_SETS.symbols;
      requiredChars.push(this.getRandomChar(CHAR_SETS.symbols));
    }

    // Validate at least one character type is selected
    if (charPool.length === 0) {
      throw new Error('At least one character type must be selected');
    }

    // Generate password
    let password = requiredChars.join('');

    // Fill remaining length with random characters from pool
    for (let i = requiredChars.length; i < length; i++) {
      password += this.getRandomChar(charPool);
    }

    // Shuffle password to mix required characters
    return this.shuffleString(password);
  }

  /**
   * Calculate password entropy (bits)
   * Higher entropy = stronger password
   */
  calculateEntropy(password: string): number {
    if (!password) return 0;

    // Determine character pool size
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += ENTROPY_CONSTANTS.poolSizes.lowercase;
    if (/[A-Z]/.test(password)) poolSize += ENTROPY_CONSTANTS.poolSizes.uppercase;
    if (/[0-9]/.test(password)) poolSize += ENTROPY_CONSTANTS.poolSizes.numbers;
    if (/[^a-zA-Z0-9]/.test(password)) poolSize += ENTROPY_CONSTANTS.poolSizes.symbols;

    // Calculate entropy: E = L * log2(poolSize)
    // Where L is password length
    return password.length * Math.log2(poolSize || 1);
  }

  /**
   * Estimate password strength based on entropy
   */
  estimateStrength(password: string): PasswordStrength {
    const entropy = this.calculateEntropy(password);
    const { weak, fair, good, strong } = ENTROPY_CONSTANTS.strength;

    if (entropy < weak) return 'weak';
    if (entropy < fair) return 'fair';
    if (entropy < good) return 'good';
    if (entropy < strong) return 'strong';
    return 'strong';
  }

  /**
   * Get a random character from a string
   */
  private getRandomChar(chars: string): string {
    const randomIndex = Math.floor(Math.random() * chars.length);
    return chars[randomIndex];
  }

  /**
   * Shuffle a string using Fisher-Yates algorithm
   */
  private shuffleString(str: string): string {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}

/**
 * Singleton instance
 */
export const passwordGenerator = new PasswordGeneratorService();
