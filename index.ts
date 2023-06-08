import express, { Request, Response } from 'express'
import { getStream, putStream, get } from '@logi.one/rest-client'
import { IncomingMessage } from 'http'
import { z } from 'zod'

const app = express()
app.use(express.json())
const port = 3000

const Body = z.object({
  url: z.string().url(),
  ocr: z.boolean(),
  maxLength: z.number().min(1)
})
type Body = z.infer<typeof Body>

app.put('/', async (req: Request, res: Response) => {
  const now = +new Date()
  const body =  Body.safeParse(req.body)
  if (!body.success) {
    console.warn('NODE:', body.error)
    return res.sendStatus(400)
  }

  try {
    const text = await extractText(body.data)
    console.log(`NODE: PUT / { ocr: ${body.data.ocr}, maxLength: ${body.data.maxLength} } => Text: ${text.length}bytes, in ${+new Date() - now}ms`)
    res.send({ text })
  } catch (err: any) {
    console.error('NODE:', err)
    if (err?.status) {
      res.sendStatus(err.status)
    } else {
      res.sendStatus(500)
    }
  }
})

waitingForTikaToStart().then(() => {
  app.listen(port, () => {
    console.log('NODE:', `Listening on port ${port}`)
  })
})

async function extractText(body: Body): Promise<string> {
  const stream = await getStream(body.url)
  const tikaResponse = await putStream(
    'http://localhost:9998/tika',
    stream, { 
      headers: { 
        'accept': 'text/plain',
        'X-Tika-OCRLanguage': 'eng',
        'X-Tika-OCRskipOcr': body.ocr ? 'false' : 'true'
      }
    }
  )
  const text = await streamToString(tikaResponse)
  return text.trim().replace(/\s+/g,' ').slice(0, body.maxLength)
}

function streamToString (stream: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

async function waitingForTikaToStart(): Promise<void> {
  console.time('NODE: waiting tika to start')
  let started = false
  while (!started) {
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
  console.timeEnd('NODE: waiting tika to start')
}

/* 
USAGE: 
curl --header "Content-Type: application/json" --request PUT --data '{ "ocr": false, "maxLength": 100000, "url":"https://sos-ch-gva-2.exo.io/public-logione/2023%20Energiapro%20Gaz%2005-062023%201083775.pdf" }' http://localhost:3000
  */