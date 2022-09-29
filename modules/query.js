const { sqlize, Requests } = require('./database')
const check_existing = require('./check_existing')

const resolve_query = async (id) => {

  try {
    if (id.length > 11) {
      let check1 = await check_existing(id)

      if (check1 instanceof Error) {
        return check1
      } else {
        return check1
      }

    } else {
      let check1 = await check_existing(id)

      if (check1) {

        await sqlize.sync({ alter: true })

        let response = await Requests.findOne({ where: { req_id: id } })

        return { title_b64: response.getDataValue('title_b64'), file_type: response.getDataValue('file_type') }

      } else if (check1 instanceof Error) {
        return check1
      } else {
        return false
      }
    }

  } catch (err) {
    return err
  }
}
module.exports = { resolve_query }
