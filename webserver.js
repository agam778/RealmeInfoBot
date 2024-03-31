import express from 'express'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const app = express()
const port = process.env.PORT || 8080

app.use(express.static('public'))

app.get('/', (req, res) => {
  const readmePath = path.join(__dirname, 'README.md')
  fs.readFile(readmePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading README file.')
    } else {
      marked.setOptions({
        mangle: false,
        headerIds: false,
      })
      const markdownContent = marked.parse(data.toString())
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>RealmeInfoBot</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
          <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 20px;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
            }

            h1 {
                font-size: 32px;
                margin-bottom: 10px;
            }

            h2 {
                font-size: 26px;
                margin-bottom: 10px;
            }

            h3 {
                font-size: 22px;
                margin-bottom: 10px;
            }

            p {
                font-size: 16px;
                line-height: 1.5;
            }

            code {
                font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${markdownContent}
          </div>
        </body>
        </html>
      `
      res.send(html)
    }
  })
})

app.listen(port, () => {
  console.log(`The web server is running on port ${port}!`)
})

export default app
