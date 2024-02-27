import { load } from 'https://deno.land/std@0.216.0/dotenv/mod.ts';

const ENV = await load();
export const port = parseInt(ENV['PORT']);
export const hostname = ENV['HOSTNAME'];
