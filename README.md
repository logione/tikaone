
# TikaONE

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
gcloud run deploy tikaone --image=europe-west6-docker.pkg.dev/logione-doc/public/tikaone --max-instances=20 --concurrency=1 --memory=512Mi --port=3000 --no-allow-unauthenticated --region=europe-west6 --platform=managed --execution-environment gen2
```
