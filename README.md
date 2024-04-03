# cranach-metadata-service
A service that allows modification of image metadata for the cda_


## Development

Run the service in development mode by executing the following command.

```sh
deno task run:dev
```

## Deployment

```
  export .env
  deno run --allow-net=$HOST_NAME:$PORT --allow-read=$IMAGE_BASE_PATH --allow-write=$IMAGE_BASE_PATH src/server.ts
```
