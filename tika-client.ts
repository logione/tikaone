import { putStream } from '@logi.one/rest-client'
import { env } from './env'

export async function extractText(stream: NodeJS.ReadableStream, ocr: boolean, maxLength: number): Promise<string> {
    const url = `${env.TIKA_URL}/tika`
    const options = {
        headers: {
            'accept': 'text/plain',
            'X-Tika-OCRLanguage': 'eng',
            'X-Tika-OCRskipOcr': ocr ? 'false' : 'true'
        }
    }
    const tikaResponse = await putStream(url, stream, options)
    const text = await streamToString(tikaResponse)
    return text.trim().replace(/\s+/g, ' ').slice(0, maxLength)
}

function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        stream.on('error', (err) => reject(err))
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}
