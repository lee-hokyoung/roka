const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const config = require("../config");

router.all("/:title/:id", async (req, res, next) => {
  let connection;
  try {
    let tbl_name = config.table(req);
    connection = await oracledb.getConnection(config.conn);
    let sql = `SELECT * FROM ${tbl_name} WHERE ID = '${req.params.id}'`;
    console.log("sql : ", sql);
    let result = await connection.execute(sql);
    res.json({ code: 1, result: result });
  } catch (err) {
    res.json({ code: 0, message: err.message });
  }
});

module.exports = router;
