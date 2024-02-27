import config from '../config.json' with { type: 'json' };

export const validateRequest = async (
  req: Request,
): Promise<{ isValid: false; message: string; statusCode: number } | { isValid: true; }> => {
  // Guard for HTTP method
  if (req.method !== 'POST') {
    return {
      isValid: false,
      message: config.statusCodes.NO_POST.message,
      statusCode: config.statusCodes.NO_POST.code,
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
  if (!req.body) {
    return {
      isValid: false,
      message: config.statusCodes.NO_BODY.message,
      statusCode: config.statusCodes.NO_BODY.code,
    };
  }

  // Guard for keys
  const body = req.body
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
