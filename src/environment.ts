import { load } from 'https://deno.land/std@0.216.0/dotenv/mod.ts';

const ENV = await load();
export const port = parseInt(ENV['PORT']);
export const hostname = ENV['HOSTNAME'];
export const imageBasePath = ENV['IMAGE_BASE_PATH'];
export const jsonDataFileSuffix = ENV['JSON_DATA_FILE_SUFFIX'];
export const apiKey = ENV['API_KEY'];
