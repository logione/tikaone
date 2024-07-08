
# TikaONE

## Dependencies

### node

```bash
wget -qO- https://unofficial-builds.nodejs.org/download/release/v20.13.1/node-v20.13.1-linux-x64-musl.tar.gz | tar xvz
mv node-v*/bin/node node
# danger !
rm -rf node-v*
```

### tika server

```bash
wget https://dlcdn.apache.org/tika/2.9.2/tika-server-standard-2.9.2.jar
```

## Deploy

```bash
# create exe
npm run pkg

# config gcloud
gcloud config set project logione-doc
gcloud auth configure-docker europe-west6-docker.pkg.dev

# login
gcloud auth login

# docker
docker build . --no-cache -t europe-west6-docker.pkg.dev/logione-doc/public/tikaone
docker push europe-west6-docker.pkg.dev/logione-doc/public/tikaone

# cloud-run
gcloud run deploy tikaone --image=europe-west6-docker.pkg.dev/logione-doc/public/tikaone --max-instances=30 --concurrency=1 --memory=1024Mi --port=3000 --no-allow-unauthenticated --region=europe-west6 --platform=managed --execution-environment gen2
```

## Test

```bash
npm run pkg
docker build -t tikaone .
docker run -it --rm -p 3000:3000 --name tikaone-test tikaone 

node stormfree.mjs
```
