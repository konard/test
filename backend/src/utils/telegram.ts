import crypto from 'crypto';

/**
 * Validates Telegram WebApp initData according to official documentation:
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) {
      return false;
    }

    // Remove hash from params
    urlParams.delete('hash');

    // Sort parameters alphabetically and create data-check-string
    const dataCheckArr: string[] = [];
    urlParams.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Generate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return false;
  }
}

/**
 * Parses Telegram initData to extract user information
 */
export function parseTelegramInitData(initData: string) {
  const urlParams = new URLSearchParams(initData);
  const userStr = urlParams.get('user');

  if (!userStr) {
    throw new Error('User data not found in initData');
  }

  const user = JSON.parse(userStr);

  return {
    telegramId: String(user.id),
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    languageCode: user.language_code,
  };
}
