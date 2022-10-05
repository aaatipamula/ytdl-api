const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser')
const resolve_post_req = require('./modules/post')
const { resolve_query } = require('./modules/query')
const { startup } = require('./modules/database');

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.route("/").get(res => {
  res.status(403).send("Not a valid url.")
})

app.route("/:reqid").get(
  async (req, res) => {

    try {

      let response = await resolve_query(req.params.reqid)

      console.log(response)

      if (typeof response === 'object') {

        const content_id = response.title_b64
        const file_type = response.file_type

        fs.access(`./content/${content_id}.${file_type}`, fs.constants.F_OK, (err) => {

          if (err) {
            console.log(err)
            res.status(500).send(err.message)

          } else {
            res.download(`./content/${content_id}.${file_type}`, `${Buffer.from(response.idone, 'base64').toString()}.${file_type}`)

          }
        })

      } else if (response) {

        fs.access(`./content/${req.params.reqid}.zip`, fs.constants.F_OK, (err) => {

          if (err) {
            console.log(err)
            res.status(500).send(err.message)

          } else {
            res.download(`./content/${req.params.reqid}.zip`)

          }
        })

      } else if (response instanceof Error) {
        res.status(500).send(response.message)
      } else {
        res.status(404).send("Request Id not found.")
      }

    } catch (err) {
      res.status(500).send(err.message)
    }
  })

app.route("/").post(
  async (req, res) => {

    if ('id' in req.body) {

      let url_type, file_type = new String()

      if (req.body.id.length > 11) {
        url_type = 'playlist'
      } else if (req.body.id.length <= 11) {
        url_type = 'video'
      }

      if ('file_type' in req.body) {
        if (!(['mp3', 'mp4'].includes(req.body.file_type))) {
          res.status(400).send('Not a valid file_type')
        } else {
          file_type = res.body.file_type
        }
      } else {

        file_type = 'webm'

        try {

          let resolve = await resolve_post_req(req.body.id, url_type, file_type)

          if (resolve instanceof Error) {
            res.status(500).send(resolve.message)
          } else {
            res.status(200).json({ req_id: resolve })
          }

        } catch (err) {
          res.status(500).send(err.message)

        }
      }

    } else {
      res.status(400).send("Missing id")
    }
  }
)

app.listen(8000, async () => {

  let start = await startup()

  if (start) {
    console.log('Application running...')
  } else {
    console.log('Something went wrong connecting to database.')
  }
})
