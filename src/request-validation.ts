import { allowedKeys, statusCodes } from '../config.json' with { type: 'json' };

export const validateRequest = async (req: Request): Promise<{ isValid: boolean, message?: string, statusCode?: number }> => {
  // Guard for HTTP method
  if (req.method !== 'POST') return {
    isValid: false,
    message:  statusCodes.NO_POST.message,
    statusCode:  statusCodes.NO_POST.code,
  }

  // Guard for path
  const path = (new URL(req.url)).pathname;
  if (path === '/' || path === '') return {
    isValid: false,
    message:  statusCodes.NO_PATH.message,
    statusCode:  statusCodes.NO_PATH.code,
  }

  // Guard for body
  if (!req.body) return {
    isValid: false,
    message:  statusCodes.NO_BODY.message,
    statusCode:  statusCodes.NO_BODY.code,
  }
  

  // Guard for keys
  const body = await req.json();
  const allKeysAreAllowed = Object.keys(body).every((key) => allowedKeys.includes(key));
  if(!allKeysAreAllowed) return {
    isValid: false,
    message:  statusCodes.DISALLOWED_KEY_USED.message,
    statusCode:  statusCodes.DISALLOWED_KEY_USED.code,
  }

  return {
    isValid: true
  }
}