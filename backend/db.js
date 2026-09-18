const oracledb = require("oracledb");
require("dotenv").config();

/*
 * Tell node-oracledb to return query rows as JavaScript objects.
 */
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
};

async function getConnection() {
  const connection = await oracledb.getConnection(dbConfig);

  return connection;
}

module.exports = {
  getConnection,
};