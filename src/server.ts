import {
  hostname,
  imageBasePath,
  jsonDataFileSuffix,
  port,
} from './environment.ts';
import { validateRequest, Body } from './request-validation.ts';
import { existsSync } from 'https://deno.land/std/fs/mod.ts';
import config from '../config.json' with { type: 'json' };

type ErrorId = keyof typeof config.statusCodes;

const buildResponse = (errorId: ErrorId, context?: string) =>
  new Response(config.statusCodes[errorId].message + (context ? `: ${context}` : ''), {
    status: config.statusCodes[errorId].code,
  });

const handler = async (req: Request) => {
  if(req.method === 'GET') {
    const requestPath = (new URL(req.url)).pathname.split('/');
    const directoryPath = `${imageBasePath}/${requestPath[1]}`;
    const filePath = `${directoryPath}/${requestPath[1]}_${
      requestPath[2]
    }-${jsonDataFileSuffix}`;
    const directoryExists = existsSync(directoryPath);
    const fileExsists = existsSync(filePath);

    if (!directoryExists || !fileExsists) return buildResponse('ARTEFACT_NOT_FOUND', filePath);

    const metadata = JSON.parse(await Deno.readTextFile(filePath));
    return new Response(JSON.stringify(metadata, null, 2));
  }
  // Try to read body
  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return new Response(config.statusCodes.NO_BODY.message, {
      status: config.statusCodes.NO_BODY.code,
    });
  }

  // Perform further validation
  const validationResult = await validateRequest(req, body);
  if (!validationResult.isValid) {
    return new Response(validationResult.message, {
      status: validationResult.statusCode,
    });
  }

  // Perform request
  const requestPath = (new URL(req.url)).pathname.split('/');
  const directoryPath = `${imageBasePath}/${requestPath[1]}`;
  const filePath = `${directoryPath}/${requestPath[1]}_${
    requestPath[2]
  }-${jsonDataFileSuffix}`;
  const directoryExists = existsSync(directoryPath);
  const fileExsists = existsSync(filePath);

  if (!fileExsists) return buildResponse('ARTEFACT_NOT_FOUND');

  const metadata = JSON.parse(await Deno.readTextFile(filePath));
  const updatedMetadata = { ...metadata, ...body };

  await Deno.writeTextFile(filePath, JSON.stringify(updatedMetadata, null, 2));

  // Send response
  return new Response(
    fileExsists
      ? `Successfully updated ${filePath}!\n${JSON.stringify(updatedMetadata)}`
      : `${filePath} not found!`,
  );
};

Deno.serve({ port, hostname, handler });
