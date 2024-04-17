import config from '../config.json' with { type: 'json' };
import { apiKey } from './environment.ts';

export const validateRequest = (
  req: Request,
  body: Body,
): { isValid: false; message: string; statusCode: number } | {
  isValid: true;
} => {
  // Guard for HTTP method
  if (req.headers.get('Authorization') !== apiKey) {
    return {
      isValid: false,
      message: config.statusCodes.UNAUTHORIZED.message,
      statusCode: config.statusCodes.UNAUTHORIZED.code,
    };
  }

  // Guard for path
  const path = (new URL(req.url)).pathname;
  if (path === '/' || path === '') {
    return {
      isValid: false,
      message: config.statusCodes.NO_PATH.message,
      statusCode: config.statusCodes.NO_PATH.code,
    };
  }

  // Guard for body
  if (!body) {
    return {
      isValid: false,
      message: config.statusCodes.NO_BODY.message,
      statusCode: config.statusCodes.NO_BODY.code,
    };
  }

  const allKeysAreAllowed = Object.keys(body).every((key) =>
    config.allowedKeys.includes(key)
  );
  if (!allKeysAreAllowed) {
    return {
      isValid: false,
      message: config.statusCodes.DISALLOWED_KEY_USED.message,
      statusCode: config.statusCodes.DISALLOWED_KEY_USED.code,
    };
  }

  return {
    isValid: true,
  };
};
