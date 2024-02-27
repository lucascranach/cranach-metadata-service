import { hostname, port, imageBasePath } from './environment.ts';
import { validateRequest } from './request-validation.ts';
import { existsSync } from 'https://deno.land/std/fs/mod.ts';

const handler = async (req: Request) => {
  await req.json()
  // Perform validation
  const validationResult = await validateRequest(req);
  if (!validationResult.isValid) {
    return new Response(validationResult.message, {
      status: validationResult.statusCode,
    });
  }

  // TODO(@yannic-bruegger): Perform request
  const body = await req.body;
  const imagePath = (new URL(req.url)).pathname;
  const exists = existsSync(imageBasePath + imagePath);

  // Send response
  
  return new Response(exists ? `Successfully updated ${new URL(req.url).pathname}!` : `${new URL(req.url).pathname} not found!`);
};

Deno.serve({ port, hostname, handler });
