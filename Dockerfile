FROM node:22-alpine3.21 AS build
WORKDIR /app
COPY . .
RUN npm ci
RUN npx esbuild ./index.ts  --bundle --minify --legal-comments=none --platform=node --target=node22 --outdir=.

FROM node:22-alpine3.21
RUN apk add tini --no-cache
WORKDIR /app
COPY --from=build /app/index.js .

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "index.js"]