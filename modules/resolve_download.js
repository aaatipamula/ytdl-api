const fs = require('fs');
const ytpl = require('ytpl');
const JSZip = require('jszip');
const ytdl_opt = require('./ytdl_opt')

const zip = new JSZip();

const resolve_download = async (id, url_type, file_type) => {

    if ( url_type === 'playlist' && ytpl.validateID(id) ) {
        
        const read_file = async (download) => {
            return new Promise(resolve => {
                fs.readFile(`./content/${download}`, (err, data) => {
                    if (err) {
                        return err
                    } else {
                        console.log(download + ' adding to zip folder')
                        resolve(zip.file(`${download}`, data))
                    }
                })
            })
        }

        const delete_file = async (download) => {
            return new Promise(resolve => {
                fs.rm(`./content/${download}`, err => {
                    if (err) {
                        return err
                    } else {
                        resolve(console.log(`deleted ${download}`))
                    }
                })
            })
        }
        

        try{

            let playlist = await ytpl(id)

            for await (let obj of playlist.items) {
                let download = await ytdl_opt(obj.shortUrl, file_type, id)

                if (download instanceof Error) {
                    return download
                } else {
                    await read_file(download)
                    await delete_file(download)
                }
            }

            return new Promise(resolve  => {
                zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                .pipe(fs.createWriteStream(`./content/${id}.zip`))
                .on('finish', () => {console.log('finished zipping'); resolve(id + file_type)})
            })

        } catch (err) {
            return err
        }


    } else if ( url_type === 'video') {

        const url = 'https://www.youtube.com/watch?v=' + id

        try {
            let video = await ytdl_opt(url, file_type)

            if (video instanceof Error) {
                return video
            } else {
                console.log(video + ' resolving download')
                return video
            }

        } catch (err) {
            return err
        }

    } else {

        return new Promise((resolve) => {
            resolve(new Error("Something went wrong when resolving downloads"))
        })
    }
}

module.exports = resolve_download;
