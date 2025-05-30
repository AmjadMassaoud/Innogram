import { createClient } from 'redis';
import config from '../configs/config';

const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

export const RESET_TOKEN_PREFIX = 'reset_token:';
export const RESET_TOKEN_ATTEMPTS = 'reset_attempts:';
export const MAX_ATTEMPTS = 3;
export const ATTEMPT_EXPIRY = 60 * 15; // 15min

export async function setResetToken(
  email: string,
  token: string,
): Promise<void> {
  await redisClient.set(`${RESET_TOKEN_PREFIX}${email}`, token, {
    EX: 15 * 60, // 15 minutes expiry
  });
}

export async function getResetToken(email: string): Promise<string | null> {
  return await redisClient.get(`${RESET_TOKEN_PREFIX}${email}`);
}

export async function incrementResetAttempts(email: string): Promise<number> {
  const attempts = await redisClient.incr(`${RESET_TOKEN_ATTEMPTS}${email}`);
  await redisClient.expire(`${RESET_TOKEN_ATTEMPTS}${email}`, ATTEMPT_EXPIRY);
  return attempts;
}

export default redisClient;
