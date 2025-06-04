import crypto from 'node:crypto';
import util from 'node:util';

const PBKDF2_ITERATIONS = 100000; // NIST recommendation: at least 10,000. Higher is better.
const PBKDF2_KEYLEN = 64; // Desired key length in bytes (e.g., 64 for SHA512)
const PBKDF2_DIGEST = 'sha512'; // Digest algorithm
const SALT_BYTES = 16; // Recommended salt length
const HASH_DELIMITER = ':'; // Delimiter to separate salt and hash

const pbkdf2Async = util.promisify(crypto.pbkdf2);

/**
 * to Hash a password using PBKDF2.
 * @param password The plain text password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derivedKey = await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  );
  return `${salt.toString('hex')}${HASH_DELIMITER}${derivedKey.toString('hex')}`;
}

/**
 * to verify a password against a stored hash (which includes the salt).
 * @param password The plain text password to verify.
 * @param storedPasswordWithSalt The stored string containing "salt:hash".
 */
export async function verifyPassword(
  password: string,
  storedPasswordWithSalt: string,
): Promise<boolean> {
  const parts = storedPasswordWithSalt.split(HASH_DELIMITER);
  if (parts.length !== 2) {
    return false;
  }
  const [saltHex, storedKeyHex] = parts;
  const salt = Buffer.from(saltHex, 'hex');

  const derivedKey = await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  );

  const storedKeyBuffer = Buffer.from(storedKeyHex, 'hex');
  return crypto.timingSafeEqual(derivedKey, storedKeyBuffer);
}
