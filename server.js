const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const fs = require('fs');
const ytdl = require('ytdl-core')
const { exit, execArgv } = require('process');

app.get("/", (req, res) =>{
    res.send(403)
})

const query = (req_id) => {

    let db = new sqlite3.Database('./db.sqlite', sqlite3.OPEN_READONLY, (err) => {

        if (err && err.code == "SQLITE_CANTOPEN") {
            console.log("Error: " + err)
            exit(1)

        } else if (err) {   
            console.log("Error: " + err)
            exit(2);
        }
    });

    return new Promise((resolve, reject) => {
        db.each(`SELECT * FROM ids WHERE reqids = '${req_id}'`, (err, row) => {

            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        });

        db.close()
    })
}

const request = (vid_id) => {

    const url = 'https://www.youtube.com/watch?v=' + vid_id
    let content_id = ''
    
    ytdl.getInfo(url, {'quality' : 'highestaudio'})
    
    .then(result => {

        content_id = Buffer.from(result.videoDetails.title).toString('base64')

        ytdl.downloadFromInfo(result)
            .pipe(fs.createWriteStream(`./audio/${content_id}.mp4`))
    })
    
    .catch(err => {
        console.log(err)
    })

    let req_id = Buffer.from(Math.floor((Math.random() * 999999) + 1).toString()).toString('base64')

    let db = new sqlite3.Database('./db.sqlite', sqlite3.OPEN_READONLY, (err) => {

        if (err && err.code == "SQLITE_CANTOPEN") {
            console.log("Error: " + err)
            exit(1)

        } else if (err) {   
            console.log("Error: " + err)
            exit(2);
        }
    });

    db.run(`INSERT INTO ids VALUES ('${req_id}', '${content_id}')`)
    
    return new Promise((resolve, reject) => {
        db.each(`SELECT * FROM ids WHERE reqids = '${req_id}'`, (err, row) => {

            if (err) {
                reject(err)
            } else {
                resolve(row)
            }
        });

        db.close()
    })
}

app.route("/:reqid").get(
    (req, res) => {

        let reqid = req.params.reqid

        request(reqid)

        .then(response => {
            
            const content_id = response.idone

            fs.access(`./audio/${content_id}.mp3`, fs.constants.F_OK, (err) => {

                if (err) {
                    console.log(err)
                    res.sendStatus(404)
    
                }else{
                    res.download(`./audio/${content_id}.mp3`, `${Buffer.from(response.idone, 'base64').toString()}.mp3`)
    
                }
            });
        })
    
        .catch(err => { console.log(err) })
    }
)

app.route("/:reqid").post(
    (req, res) => {

        let reqid = req.params.reqid

        request(reqid)

        .then(response => {
            
            const content_id = response.idone

            fs.access(`./audio/${content_id}.mp3`, fs.constants.F_OK, (err) => {

                if (err) {
                    console.log(err)
                    res.sendStatus(404)
    
                }else{
                    res.download(`./audio/${content_id}.mp3`, `${Buffer.from(response.idone, 'base64').toString()}.mp3`)
    
                }
            });
        })
    
        .catch(err => { console.log(err) })
    }
)

app.listen(8000, () => {
    console.log('Application running...')
});
