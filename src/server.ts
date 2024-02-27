import { hostname, port } from './environment.ts';
import { validateRequest } from './request-validation.ts';

const handler = async (req: Request) => {
  // Perform validation
  const validationResult = await validateRequest(req);
  if (!validationResult.isValid) {
    return new Response(validationResult.message, {
      status: validationResult.statusCode,
    });
  }

  // TODO(@yannic-bruegger): Perform request

  // Send response
  return new Response(`Successfully updated ${new URL(req.url).pathname}!`);
};

Deno.serve({ port, hostname, handler });
