import { get, putStream } from '@logi.one/rest-client'
import { exec } from 'child_process'

export class TikaClient {
    private startingPromise: Promise<void>

    constructor() {
        this.startingPromise = this.startTika()
    }

    async extractText(stream: NodeJS.ReadableStream, ocr: boolean, maxLength: number, nTry = 100): Promise<string> {
        await this.startingPromise
        try {
            const tikaResponse = await putStream(
                'http://localhost:9998/tika',
                stream, { 
                    headers: { 
                    'accept': 'text/plain',
                    'X-Tika-OCRLanguage': 'eng',
                    'X-Tika-OCRskipOcr': ocr ? 'false' : 'true'
                    }
                }
            )
            const text = await this.streamToString(tikaResponse)
            return text.trim().replace(/\s+/g,' ').slice(0, maxLength)
        } catch (err: any) {
            console.error('NODE:', err)
            if (err?.status && err?.cause?.code === 'ECONNREFUSED' && nTry > 0) {
                console.log('NODE: Tika server not responding: ECONNREFUSED')
                await new Promise(resolve => setTimeout(resolve, 20))
                return this.extractText(stream, ocr, maxLength, --nTry)
            }
            throw err
        }
    }

    private async startTika() {
        exec('java -jar tika-server-standard-2.9.0.jar').on('exit', (code) => {
            console.error(`NODE: Tika exited with code: ${code} - restarting`)
            this.startingPromise = this.startTika()
        })
        console.log('NODE: Starting tika server')
        let started = false
        for (let i = 0; i < 1500 && !started; i++) {
            try {
                await get('http://localhost:9998/version')
                started = true
            } catch (err: any) {
                if (err?.cause?.code !== 'ECONNREFUSED') {
                    console.error(err?.cause)
                }
                await new Promise(resolve => setTimeout(resolve, 20))
            }
        }
        if (!started) {
            console.error('NODE: Tika server won\'t start after 30s - exiting')
            process.exit(1)
        }
        console.log('NODE: Tika server started')
    }

    private streamToString (stream: NodeJS.ReadableStream): Promise<string> {
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        stream.on('error', (err) => reject(err))
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      })
    }
}