import { Logger, existsSync } from './deps.ts';
import { imageBasePath, jsonDataFileSuffix } from './environment.ts';
import { validateRequest } from './request-validation.ts';

import config from '../config.json' with { type: 'json' };
import { hasPathPrefix, pathPrefix } from './environment.ts';

const logger = new Logger();
await logger.initFileLogger('./log', { rotate: true });

const getParametersFromUrl = (givenUrl: string) => {
  const url = new URL(givenUrl);
  const artefact = url.searchParams.get('artefact') || '';
  const image = url.searchParams.get('image') || '';
  return { artefact, image }
}

const getPathParametersFromUrl = (givenUrl: string) => {
  let path = new URL(givenUrl).pathname;
  if (hasPathPrefix) path = path.replace(pathPrefix, '');
  const requestPath = path.split('/');
  return { artefact: requestPath[1], image: requestPath[2] }
}

export const createFolderOrFileHandler = async (req: Request) => {
  const { artefact, image } = getPathParametersFromUrl(req.url);
  const filePathInfo = getFilePathInformation(artefact, image);
  const metadataFileContentWithoutValues = config.allowedKeys.reduce((a: { [key: string]: string }, b: string) => (a[b]='', a), {});
  try {
    if (!existsSync(filePathInfo.directoryPath)) {
      await Deno.mkdir(filePathInfo.directoryPath);
    }
    
    Deno.writeTextFile(filePathInfo.filePath, JSON.stringify(metadataFileContentWithoutValues, null, 2));
    return new Response(config.statusCodes.SUCCESS_CREATING_FILE.message, {
      status: config.statusCodes.SUCCESS_CREATING_FILE.code,
    });
  } catch (e) {
    return new Response(config.statusCodes.ERROR_CREATING_FILE.message, {
      status: config.statusCodes.ERROR_CREATING_FILE.code,
    });
  }
}

export const getInjectionHandler = async (req: Request) => {
  logger.info(`[${req.url}] Handler: getInjectionHandler`)
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
    artefact,
    image,
    pathPrefix,
    suggestions: config.suggestions,
  });
  return new Response(`this.globalData = ${dataToInject}`);
}

export const getEditorUIHandler = async (req: Request) => {
  logger.info(`[${req.url}] Handler: getEditorUIHandler`)
  const artefact = new URL(req.url).searchParams.get('artefact')
  const image = new URL(req.url).searchParams.get('image')
  let path = new URL(req.url).pathname;
  if (hasPathPrefix) path = path.replace(pathPrefix, '');
  const contents = await Deno.readTextFile('./src/static/' + path)
  const newContent = contents.replace('<!-- INJECTION -->', `<script src="injectedData.js?artefact=${artefact}&image=${image}"></script>`)
  return new Response(newContent, {headers: {'Content-Type': 'text/html; charset=utf-8'}});
}

export const getFileHandler = async (req: Request) => {
  logger.info(`[${req.url}] Handler: getFileHandler`)
  let path = new URL(req.url).pathname;
  if (hasPathPrefix) path = path.replace(pathPrefix, '');
  const file = await Deno.open('./src/static/' + path, { read: true });
  const readableStream = file.readable;
  return new Response(readableStream);
}

export const getMetadataHandler = async (req: Request) => {
  logger.info(`[${req.url}] Handler: getMetadataHandler`)
  let path = new URL(req.url).pathname;
  if (hasPathPrefix) path = path.replace(pathPrefix, '');
  const requestPath = path.split('/');
  const filePath = buildFilePath(requestPath[1], requestPath[2])
  const metadata = await getMetadata(filePath);
  return new Response(JSON.stringify(metadata, null, 2));
}

export const updateMetadataHandler = async (req: Request) => {
  logger.info(`[${req.url}] Handler: updateMetadataHandler`)
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
  let path = new URL(req.url).pathname;
  if (hasPathPrefix) path = path.replace(pathPrefix, '');
  const requestPath = path.split('/');
  const filePath = buildFilePath(requestPath[1], requestPath[2])
  const metadata = await getMetadata(filePath).catch((e) => {console.info(e)});
  const updatedMetadata = { ...metadata, ...body };
  logger.info(JSON.stringify({filePath, metadata, updatedMetadata}))
  logger.info(JSON.stringify(`Attempting to write to file ${filePath}`))
  try {
    await Deno.writeTextFile(filePath, JSON.stringify(updatedMetadata, null, 2));
  } catch (e) {
    logger.error(JSON.stringify({filePath, metadata, updatedMetadata}))
    logger.error(JSON.stringify(e))
    return new Response(config.statusCodes.ERROR_WRITING_FILE.message, {
      status: config.statusCodes.ERROR_WRITING_FILE.code,
    });
  }
  logger.info(JSON.stringify(`Successfully wrote to file ${filePath}`))
  return new Response(`Successfully updated ${filePath}!\n${JSON.stringify(updatedMetadata)}`);
}

const getFilePathInformation = (artefact: string, image: string) => {
  const directoryPath = `${imageBasePath}/${artefact}`;
  const filePath = `${directoryPath}/${artefact}_${image}${jsonDataFileSuffix}`;
  return { directoryPath, filePath };
}

const buildFilePath = (artefact: string, image: string) => getFilePathInformation(artefact, image).filePath;

const getMetadata = async (filePath: string) => {
  const fileExsists = existsSync(filePath);
  if(!fileExsists) return {}
  const metadata = JSON.parse(await Deno.readTextFile(filePath));
  return metadata;
}