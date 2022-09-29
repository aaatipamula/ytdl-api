const check_existing = require('./check_existing')
const resolve_download = require('./resolve_download');
const insert_db = require('./insert_db')

const resolve_post_req = async (id, url_type, file_type) => {

    const req_id = id + file_type

    try {

        let exists = await check_existing(req_id)
            
        console.log(exists)
        
        if (exists) {

            console.log('already exists')
            return req_id

        } else if (!exists) {

            let download_result = await resolve_download(id, url_type, file_type)

            if (download_result instanceof Error) {
                return download_result
            } else {

                let options = {}

                if (url_type === 'playlist') {
                    options = { req_id: download_result }
                } else if (url_type === 'video') {
                    
                    options = { req_id: req_id, title_b64: download_result, file_type: file_type }
                }

                return await insert_db(options)

            }
        } else if (exists instanceof Error) {
            return exists
        }

    } catch(err) {
        return err
    }
}

module.exports = resolve_post_req;
