import crypto from 'crypto';

/**
 * Telegram authentication data received from the login widget
 */
export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verify Telegram login widget data
 * Based on: https://core.telegram.org/widgets/login#checking-authorization
 */
export function verifyTelegramAuth(
  authData: TelegramAuthData,
  botToken: string
): boolean {
  const { hash, ...dataToCheck } = authData;

  // Create data-check-string
  const dataCheckArr = Object.keys(dataToCheck)
    .sort()
    .map((key) => `${key}=${(dataToCheck as any)[key]}`);
  const dataCheckString = dataCheckArr.join('\n');

  // Create secret key from bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Verify hash matches
  if (calculatedHash !== hash) {
    return false;
  }

  // Check auth_date is not too old (1 day)
  const authDate = new Date(authData.auth_date * 1000);
  const now = new Date();
  const dayInMs = 24 * 60 * 60 * 1000;

  if (now.getTime() - authDate.getTime() > dayInMs) {
    return false;
  }

  return true;
}

/**
 * Extract user info from verified Telegram auth data
 */
export function extractTelegramUser(authData: TelegramAuthData) {
  return {
    id: authData.id.toString(),
    firstName: authData.first_name,
    lastName: authData.last_name || '',
    username: authData.username,
    email: authData.username
      ? `${authData.username}@telegram.user`
      : `${authData.id}@telegram.user`,
    profilePhoto: authData.photo_url,
  };
}
