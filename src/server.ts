import { buildResponse } from './utils.ts';
import { hostname, port, pathPrefix } from './environment.ts';
import { getFileHandler, getInjectionHandler, getMetadataHandler, updateMetadataHandler, getEditorUIHandler, createFolderOrFileHandler } from './handler.ts';
import { Logger } from './deps.ts';

const logger = new Logger();
await logger.initFileLogger('./log', { rotate: true });

const handler = async (req: Request) => {
  logger.info(`[${req.url}]\n New connection!`)
  switch (req.method) {
    case 'GET':
      // Case UI
      if(new URL(req.url).pathname === pathPrefix + '/metadataForm.html') return getEditorUIHandler(req);
      if(new URL(req.url).pathname === pathPrefix + '/metadataForm.js') return await getFileHandler(req);
      if(new URL(req.url).pathname === pathPrefix + '/metadataForm.css') return await getFileHandler(req);
      if(new URL(req.url).pathname === pathPrefix + '/injectedData.js') return await getInjectionHandler(req);
      if(new URL(req.url).pathname === pathPrefix + '/favicon.ico') return new Response('Not found!', {status: 404});
      
      // Case API
      return await getMetadataHandler(req);
    case 'POST':
      // Update metadata
      return await updateMetadataHandler(req);
    case 'PUT':
      // New image or artefact
      return await createFolderOrFileHandler(req);
    default:
      return buildResponse('UNSUPPORTED_HTTP_VERB');
  }
};

Deno.serve({ port, hostname, handler });
