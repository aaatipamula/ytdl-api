const { sqlize, Requests } = require('./database')
const { Model } = require('sequelize')

const check_existing = async (req_id) =>{

    try {

        await sqlize.sync({ alter: true})

        let res_val = await Requests.findOne({ where: { req_id: req_id } })

        if (res_val instanceof Model) {
            if (req_id == res_val.getDataValue('req_id')) {
                console.log(res_val.getDataValue('req_id'))
                return true
            }
        }else if (res_val instanceof Error) {
            return res_val
        } else {
            return false
        }

    } catch (err) {
        return err
    }

}

module.exports = check_existing
