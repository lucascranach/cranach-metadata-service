import { buildResponse } from './utils.ts';
import { hostname, port } from './environment.ts';
import { getFileHandler, getInjectionHandler, getMetadataHandler, updateMetadataHandler, getEditorUIHandler } from './handler.ts';

const handler = async (req: Request) => {
  switch (req.method) {
    case 'GET':
      // Case UI
      if(new URL(req.url).pathname === '/metadata/metadataForm.html') return getEditorUIHandler(req);
      if(new URL(req.url).pathname === '/metadata/metadataForm.js') return await getFileHandler(req);
      if(new URL(req.url).pathname === '/metadata/metadataForm.css') return await getFileHandler(req);
      if(new URL(req.url).pathname === '/metadata/injectedData.js') return await getInjectionHandler(req);
      if(new URL(req.url).pathname === '/metadata/favicon.ico') return new Response('Not found!', {status: 404});

      // Case API
      return await getMetadataHandler(req);
    case 'POST':
      return await updateMetadataHandler(req);

    default:
      return buildResponse('UNSUPPORTED_HTTP_VERB');
  }
};

Deno.serve({ port, hostname, handler });
