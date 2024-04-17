import { existsSync } from './deps.ts';
import { apiKey, imageBasePath, jsonDataFileSuffix } from './environment.ts';
import { validateRequest } from './request-validation.ts';

import config from '../config.json' with { type: 'json' };

export const getInjectionHandler = async (req: Request) => {
  const url = new URL(req.url);
  const fields: {[key: string]: string|null} = {};
  const artefact = url.searchParams.get('artefact');
  const image = url.searchParams.get('image');
  const filePath = buildFilePath(artefact || '', image || '')
  const metadata = await getMetadata(filePath);

  config.allowedKeys.forEach((allowedKey: string) => {
    fields[allowedKey] = metadata[allowedKey];
  })
  const dataToInject = JSON.stringify({
    fields,
    apiKey,
    artefact,
    image,
  });
  return new Response(`this.globalData = ${dataToInject}`);
}

export const getEditorUIHandler = async (req: Request) => {
  const artefact = new URL(req.url).searchParams.get('artefact')
  const image = new URL(req.url).searchParams.get('image')
  const contents = await Deno.readTextFile('./src/static/' + new URL(req.url).pathname)
  const newContent = contents.replace('<!-- INJECTION -->', `<script src="injectedData.js?artefact=${artefact}&image=${image}"></script>`)
  return new Response(newContent, {headers: {'Content-Type': 'text/html; charset=utf-8'}});
}

export const getFileHandler = async (req: Request) => {
  const file = await Deno.open('./src/static/' + new URL(req.url).pathname, { read: true });
  const readableStream = file.readable;
  return new Response(readableStream);
}

export const getMetadataHandler = (req: Request) => {
  const requestPath = (new URL(req.url)).pathname.split('/');
  const filePath = buildFilePath(requestPath[2], requestPath[3])
  const metadata = getMetadata(filePath);
  return new Response(JSON.stringify(metadata, null, 2));
}

export const updateMetadataHandler = async (req: Request) => {
  // Try to read body
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(config.statusCodes.NO_BODY.message, {
      status: config.statusCodes.NO_BODY.code,
    });
  }

  // Perform further validation
  const validationResult = validateRequest(req, body);
  if (!validationResult.isValid) {
    return new Response(validationResult.message, {
      status: validationResult.statusCode,
    });
  }

  // Perform request
  const requestPath = (new URL(req.url)).pathname.split('/');
  const filePath = buildFilePath(requestPath[1], requestPath[2])
  const metadata = await getMetadata(filePath).catch((e) => {console.info(e)});
  const updatedMetadata = { ...metadata, ...body };
  await Deno.writeTextFile(filePath, JSON.stringify(updatedMetadata, null, 2));
  return new Response(`Successfully updated ${filePath}!\n${JSON.stringify(updatedMetadata)}`);
}

const buildFilePath = (artefact: string, image: string) => {
  const directoryPath = `${imageBasePath}/${artefact}`;
  return `${directoryPath}/${artefact}_${image}-${jsonDataFileSuffix}`;
}

const getMetadata = async (filePath: string) => {
  const fileExsists = existsSync(filePath);
  if(!fileExsists) return {}
  const metadata = JSON.parse(await Deno.readTextFile(filePath));
  return metadata;
}