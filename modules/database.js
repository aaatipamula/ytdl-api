const { Sequelize, DataTypes } = require('sequelize')

const sqlize = new Sequelize({ dialect: 'sqlite', storage: './database.sqlite', logging: console.log })

const Requests = sqlize.define('Requests', {

  req_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },

  title_b64: {
    type: DataTypes.STRING(99999),
    allowNull: true
  },

  file_type: {
    type: DataTypes.STRING(5),
    allowNull: true
  }

});

const startup = async () => {

  return new Promise((resolve, reject) => {
    try {
      sqlize.authenticate();
      console.log('Database successfully connected!')
      resolve(true)

    } catch (error) {
      console.error('Database not found!')
      reject(false)
    }

  })
}

module.exports = { sqlize, Requests, startup }
