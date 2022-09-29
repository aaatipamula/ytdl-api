const ytdl = require('ytdl-core')
const fs = require('fs')

const ytdl_opt = async (url, file_type, playlist_id = '') => {

    let opts = {}
    let content_id, return_val = new String();

    if (file_type === 'mp3') {
        opts = { quality: 'highestaudio' }
    } else {
        opts = { quality: 'highest' }
    }


    if (ytdl.validateURL(url)){

        try {

            const ytdl_info = await ytdl.getInfo(url, opts)

            if (!(playlist_id === '')) {
                content_id = ytdl_info.videoDetails.title
                return_val = `${content_id}.${file_type}`
            } else {
                content_id = Buffer.from(ytdl_info.videoDetails.title).toString('base64')
                return_val = content_id
            }

            return new Promise((resolve, reject) => {

                ytdl.downloadFromInfo(ytdl_info)
                    .pipe(fs.createWriteStream(`./content/${content_id}.${file_type}`))
                    .on('finish', () => { console.log(return_val + ' ytdl_returning'); resolve(return_val)})
            })
                
        } catch (err) {
            return err
        }

    } else {
        return new Error("Could not validate URL.")
    }
}

module.exports = ytdl_opt
