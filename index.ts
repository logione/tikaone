import express, { Request, Response } from 'express'
import { getStream } from '@logi.one/rest-client'
import { z } from 'zod'
import { extractText } from './tika-client'
import { env } from './env'
import { Server } from 'http'

const app = express()
app.use(express.json())

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
    console.warn(body.error)
    return res.sendStatus(400)
  }

  try {
    const stream = await getStream(body.data.url)
    const text = await extractText(stream, body.data.ocr, body.data.maxLength)
    console.log(`PUT / { ocr: ${body.data.ocr}, maxLength: ${body.data.maxLength} } => Text: ${text.length}bytes, in ${+new Date() - now}ms`)
    res.send({ text })
  } catch (err: any) {
    console.error(err)
    if (err?.status) {
      res.sendStatus(err.status)
    } else {
      res.sendStatus(500)
    }
  }
})

async function close() {
  process.removeAllListeners('SIGINT')
  process.removeAllListeners('SIGTERM')
  if (server) {
    console.log('Closing server')
    const srv = server
    server = undefined
    await new Promise<void>((resolve, reject) => {
      srv.close((err) => {
        if (err) {
          console.error('Error closing server', err)
          reject(err)
        } else {
          resolve()
        }
      })
    })
    console.log('Server closed gracefully')
  } else {
    console.warn('Server already closed')
  }
}

let server: Server | undefined = app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`)
})

process.on('SIGINT', () => close())
process.on('SIGTERM', () => close())

/* 
USAGE: 
curl --header "Content-Type: application/json" --request PUT --data '{ "ocr": false, "maxLength": 100000, "url":"https://sos-ch-gva-2.exo.io/public-logione/2023%20Energiapro%20Gaz%2005-062023%201083775.pdf" }' http://localhost:3000
  */