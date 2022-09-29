const { sqlize, Requests } = require('./database')

const insert_db = async (options) => {

    try{

        await sqlize.sync()
        let insert = await Requests.create(options)

        if (insert instanceof Error) {
            return insert
        } else {
            return insert.getDataValue('req_id')
        }

    } catch (err) {
        return err
    }

}

module.exports = insert_db
