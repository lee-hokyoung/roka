const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const config = require("../config");

/* GET home page. */
router.all("/:title/:page?", async (req, res, next) => {
  let tbl_name = config.table(req);
  let connection;
  try {
    let list = [],
      left_obj = {},
      sql,
      left;
    connection = await oracledb.getConnection(config.conn);

    // POST로 넘어왔을 경우, WHERE 절 삽입
    let where_query = "";
    let filter = req.body.filter;
    if (filter) {
      filter.split(";").forEach((v) => {
        if (v) {
          where_query += ` AND ${v.split(":")[0]} = '${v.split(":")[1]}'`;
        }
      });
    }

    /*  left facet 만들기  */
    query_list = [
      { title: "결재권자", colName: "ceo_name" },
      { title: "업무기능", colName: "task_function" },
      { title: "생산기관", colName: "create_org" },
    ];
    for (var i = 0; i < query_list.length; i++) {
      list = []; // 각 facet에 넣어줄 리스트 초기화
      //  sql 구문 작성
      sql = `SELECT ${query_list[i].colName}, COUNT(*) as cnt FROM ${tbl_name}`;
      sql += ` WHERE 1=1`;
      sql += where_query;
      sql += ` GROUP BY ${query_list[i].colName} `;

      //  sql 실행
      left = await connection.execute(sql);
      //  left facet 이 결재권자일 경우 00대 카테고리를 생성해준다.
      if (query_list[i].title === "결재권자") {
        let title_list = [];
        left.rows.forEach((v) => {
          let age = Math.ceil(v[0].split("_")[0].replace("대", "") / 10);
          let key = age === 1 ? "01" : (age - 1) * 10 + 1;
          key += "~" + age * 10 + "대";
          let obj = {};
          if (title_list.indexOf(key) === -1) {
            obj[v[0]] = v[1];
            list.push({ title: key, count: 1, list: [obj] });
            title_list.push(key);
          } else {
            list.forEach((w) => {
              if (w.title === key) {
                w.count = w.count + 1;
                obj[v[0]] = v[1];
                w.list = w.list.concat(obj);
              }
            });
          }
        });
        //  이름 순으로 정렬
        list.forEach((v) => {
          v.list = v.list.sort((a, b) => {
            return Object.keys(a) > Object.keys(b) ? 1 : Object.keys(a) < Object.keys(b) ? -1 : 0;
          });
        });
      } else {
        left.rows.forEach((v) => {
          list.push({ title: v[0], count: v[1] });
        });
      }
      left_obj[query_list[i].title] = list;
    }
    /*  left facet 만들기 끝 */

    /*  body 부분  */
    let page = req.params.page || 1;
    let limit = req.body.limit || 20;
    sql = `SELECT * FROM
    (
      SELECT rownum as rn, ori.* FROM ${tbl_name} ori WHERE 1 = 1 ${where_query}
    ) row_table
    WHERE row_table.rn BETWEEN ${(page - 1) * limit + 1} AND ${page * limit} ${where_query}`;

    let body = await connection.execute(sql);

    sql = `SELECT count(*) as cnt FROM ${tbl_name} WHERE 1 = 1 ${where_query}`;
    let total = await connection.execute(sql);

    /*  body 부분  끝*/
    res.render("facet", {
      left: left_obj,
      body: body.rows,
      post: req.body,
      title: req.params.title,
      total: total.rows[0],
      limit: limit,
      page: page,
    });
  } catch (err) {
    console.error(err.message);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
  // let sql = `SELECT * FROM menu WHERE lv = 1 AND menu_name = '${title}'`;
  // let result = await client.queryAllAsObjects(sql);
  // sql = `SELECT * FROM menu WHERE parent = '${result[0].id}'`;
  // let left = await client.queryAllAsObjects(sql);
  // let left_content = {};
  // switch (req.params.title) {
  //   case "총장결재기록물":
  //     tbl_name = "tbl_ceo_archive";
  //     sql = `SELECT owner as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY owner`;
  //     left_content["결재권자"] = await client.queryAllAsObjects(sql);

  //     sql = `SELECT task_function as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY task_function;`;
  //     left_content["업무기능"] = await client.queryAllAsObjects(sql);

  //     sql = `SELECT prd_agency as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY prd_agency`;
  //     left_content["생산기관"] = await client.queryAllAsObjects(sql);

  //     sql = `SELECT reporter as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY reporter;`;
  //     left_content["기안 보고자"] = await client.queryAllAsObjects(sql);

  //     sql = `SELECT keyword as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY keyword;`;
  //     left_content["핵심키워드"] = await client.queryAllAsObjects(sql);

  //     sql = `SELECT timeline as left_name, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY timeline;`;
  //     left_content["시간"] = await client.queryAllAsObjects(sql);
  //     break;
  //   case "정책기록":
  //     tbl_name = "tbl_ceo_archive";
  //     break;
  //   case "전투기록":
  //     tbl_name = "tbl_ceo_archive";
  //     break;
  //   case "사여단기록":
  //     tbl_name = "tbl_ceo_archive";
  //     break;
  // }
  // sql = `SELECT owner, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY owner;`;
  // sql = `SELECT task_function, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY task_function;`;
  // sql = `SELECT prd_agency, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY prd_agency;`;
  // sql = `SELECT keyword, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY keyword;`;
  // sql = `SELECT timeline, COUNT(*) AS cnt FROM tbl_ceo_archive GROUP BY timeline;`;

  // res.render("facet", {
  //   active: title,
  //   left: left,
  //   left_content: left_content,
  // });
});

module.exports = router;
