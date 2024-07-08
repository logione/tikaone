import { put } from '@logi.one/stormfree'

// run:
// node stormfree.mjs

await put('http://localhost:3000', {
    json: {
        url: 'https://fr.wikipedia.org/wiki/Test',
        ocr: false,
        maxLength: 100
    }
})