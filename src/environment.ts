import { load } from './deps.ts';

const ENV = await load();
export const port = parseInt(ENV['PORT']);
export const hostname = ENV['HOST_NAME'];
export const imageBasePath = ENV['IMAGE_BASE_PATH'];
export const jsonDataFileSuffix = ENV['JSON_DATA_FILE_SUFFIX'];
export const apiKey = ENV['API_KEY'];
export const hasPathPrefix = ENV['PATH_PREFIX'] !== '';
export const pathPrefix = ENV['PATH_PREFIX'] || '';
