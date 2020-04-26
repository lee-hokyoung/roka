const express = require("express");
const router = express.Router();
const CUBRID = require("node-cubrid");
const dbConfig = {
  host: "localhost",
  port: 33000,
  user: "dba",
  password: "alsdud1218!",
  database: "roka_db",
};
const client = CUBRID.createConnection(dbConfig);
client.connect(function (err) {
  // 연결 확인
  if (err) {
    throw err;
  } else {
    console.log("connection is established");
    client.close(function (err) {
      // 연결 종료
      if (err) {
        throw err;
      } else {
        console.log("connection is closed");
      }
    });
  }
});

/* GET home page. */
router.get("/:title", async (req, res, next) => {
  let title = req.params.title;
  let sql = `SELECT * FROM menu WHERE lv = 1 AND menu_name = '${title}'`;
  let result = await client.queryAllAsObjects(sql);
  sql = `SELECT * FROM menu WHERE parent = '${result[0].id}'`;
  let left = await client.queryAllAsObjects(sql);
  let left_content = {};
  switch (req.params.title) {
    case "총장결재기록물":
      tbl_name = "tbl_ceo_archive";
      sql = `SELECT owner as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY owner`;
      left_content["결재권자"] = await client.queryAllAsObjects(sql);

      sql = `SELECT task_function as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY task_function;`;
      left_content["업무기능"] = await client.queryAllAsObjects(sql);

      sql = `SELECT prd_agency as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY prd_agency`;
      left_content["생산기관"] = await client.queryAllAsObjects(sql);

      sql = `SELECT reporter as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY reporter;`;
      left_content["기안 보고자"] = await client.queryAllAsObjects(sql);

      sql = `SELECT keyword as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY keyword;`;
      left_content["핵심키워드"] = await client.queryAllAsObjects(sql);

      sql = `SELECT timeline as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY timeline;`;
      left_content["시간"] = await client.queryAllAsObjects(sql);
      break;
    case "정책기록":
      tbl_name = "tbl_ceo_archive";
      break;
    case "전투기록":
      tbl_name = "tbl_ceo_archive";
      break;
    case "사여단기록":
      tbl_name = "tbl_ceo_archive";
      break;
  }
  sql = `SELECT owner, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY owner;`;
  sql = `SELECT task_function, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY task_function;`;
  sql = `SELECT prd_agency, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY prd_agency;`;
  sql = `SELECT keyword, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY keyword;`;
  sql = `SELECT timeline, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY timeline;`;

  res.render("facet", {
    active: title,
    left: left,
    left_content: left_content,
  });
});

module.exports = router;
