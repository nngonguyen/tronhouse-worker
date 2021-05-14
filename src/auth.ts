import express from 'express'
import fs from 'fs'
import { Credentials, OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import http from 'http'
import makeDir from 'make-dir'
import open from 'open'
import path from 'path'

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
]

const port = 3000
const redirectPath = '/oauth2callback'
const redirectUrl = `http://localhost:${port}${redirectPath}`

const tokenPath = '.data/token.json'
const credentialsPath = '.data/credentials.json'

function getCredentials() {
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Cannot read .data/credentials.json`)
  }
  return JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))
}

function getToken(): Credentials | null {
  if (fs.existsSync(tokenPath)) {
    return JSON.parse(fs.readFileSync(tokenPath, 'utf-8'))
  }
  return null
}

const { client_secret, client_id } = getCredentials()

async function initAuth(): Promise<OAuth2Client> {
  const authClient = new google.auth.OAuth2(client_id, client_secret, redirectUrl)
  const token = getToken()
  if (token) {
    authClient.setCredentials(token)
    return authClient
  }

  const app = express()
  let server: http.Server | undefined = undefined

  return new Promise((resolve, reject) => {
    app.get(redirectPath, async (req) => {
      console.log(req.query)
      const code = req.query['code'] as string
      authClient.getToken(code, (err, token) => {
        if (err) {
          reject(err)
          return
        }
        if (!token) {
          reject('Cannot get token')
          return
        }
        makeDir.sync(path.dirname(tokenPath))
        fs.writeFileSync(tokenPath, JSON.stringify(token))
        authClient.setCredentials(token)
        server?.close()
        resolve(authClient)
      })
    })

    server = app.listen(port)

    const authUrl = authClient.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
    open(authUrl)
  })
}

const drive = google.drive('v3')

export async function uploadFile(fileName: string) {
  const fileSize = fs.statSync(fileName).size
  const res = await drive.files.create(
    {
      requestBody: {
        name: 'packages/xxx-111',
        // a requestBody element is required if you want to use multipart
      },
      media: {
        body: fs.createReadStream(fileName),
      },
    },
    {
      // Use the `onUploadProgress` event from Axios to track the
      // number of bytes uploaded to this point.
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / fileSize) * 100
        process.stdout.write(`${Math.round(progress)}% complete`)
      },
    },
  )
  console.log(res.data)
  return res.data
}

async function run() {
  const auth = await initAuth()
  google.options({ auth })
  const result = await drive.files.list({ q: `name = 'packages/xxx-111'` })
  console.log(result.data)
  // await uploadFile('./README.md')
  /*
  const params = { pageSize: 12 }
  const res = await drive.files.list(params)
  console.log(res.data)
  */
}

run()
