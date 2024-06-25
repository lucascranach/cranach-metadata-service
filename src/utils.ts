import config from '../config.json' with { type: 'json' };

export type ErrorId = keyof typeof config.statusCodes;

export const buildResponse = (errorId: ErrorId, context?: string) =>
  new Response(
    config.statusCodes[errorId].message + (context ? `: ${context}` : ''),
    { status: config.statusCodes[errorId].code },
  );
