
# TikaONE

## Test

```bash
docker run -d --rm -p 9998:9998 --name tika apache/tika:3.1.0.0-full
npm run build
export TIKA_URL=http://localhost:9998
npm start

# in another terminal
node stormfree.mjs

# clean
unset TIKA_URL
docker stop tika
```
