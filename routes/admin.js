const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const Excel = require("exceljs");
const exceljs = require("exceljs");
const oracledb = require("oracledb");
const config = require("../config");

/* 관리자 페이지 */
router.get("", async (req, res, next) => {
  res.render("admin");
});

//  대용량 엑셀 파일 업로드 화면
router.get("/upload", async (req, res) => {
  res.render("admin_upload");
});
//  대용량 엑셀 파일 업로드
const excelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file : ", file);
    cb(null, "upload_excel/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadExcel = multer({ storage: excelStorage });
router.post("/upload", uploadExcel.single("excelFile"), async (req, res) => {
  //  upload_excel 폴더 내 모든 파일 삭제
  let upload_file = req.file.originalname;
  let dir_files = fs.readdirSync("upload_excel/");
  dir_files.forEach((v) => {
    if (v !== upload_file) {
      if (fs.existsSync("upload_excel/") + v) {
        fs.unlinkSync("upload_excel/" + v);
      }
    }
  });
  res.end();
});
//  파일 읽기
router.post("/readFile", async (req, res) => {
  const workbook = new Excel.Workbook();
  const filename = req.body.filename;
  const path = "./upload_excel/" + filename;
  console.log("path : ", path);
  if (filename !== "") {
    let list = [];
    workbook.xlsx.readFile(path).then(() => {
      let ws = workbook.getWorksheet("Sheet1");
      ws.eachRow(function (row, rowNum) {
        list.push(row.values.slice(1));
      });
      // let ws_obj = {};
      // ws.eachRow({ includeEmpty: true }, function (row, rowNum) {
      //   if (rowNum === 1) console.log("row info : ", row._cells);
      //   // console.log("row : ", row);
      // });
      // console.log("ws : ", ws);
      // res.end();
      res.json({ code: 1, worksheet: list });
    });
  } else {
    res.json({ code: 0, message: "오류" });
  }
});
//  파일 each insert
router.post("/insertEach", async (req, res) => {
  let list = req.body.list;
  let results = [];
  try {
    let connection = await oracledb.getConnection(config.conn);
    let start = Date.now();
    let query = `INSERT INTO CEO_ARCHIVE (
      no, id, item_name, created_date, create_org,
      task_function, education_meeting, ceo_name, report_type, region_space, 
      region, place, army, term, term_desc, 
      description, keyword, event, reporter, person, 
      person_group, image, created_at) 
    `,
      value_query,
      insert_row = 0;
    for (var i = 0; i < list.length; i++) {
      value_query = ` VALUES (
        :0, :1, :2, :3, :4, 
        :5, :6, :7, :8, :9, 
        :10, :11, :12, :13, :14, 
        :15, :16, :17, :18, :19, 
        :20, :21, :22
      ) `;
      let result = await connection.execute(
        query + value_query,
        [
          list[i]["no"],
          list[i]["id"],
          list[i]["item_name"],
          list[i]["created_date"],
          list[i]["create_org"],
          list[i]["task_function"],
          list[i]["education_meeting"],
          list[i]["ceo_name"],
          list[i]["report_type"],
          list[i]["region_space"],
          list[i]["region"],
          list[i]["place"],
          list[i]["army"],
          list[i]["term"],
          list[i]["term_desc"],
          list[i]["description"],
          list[i]["keyword"],
          list[i]["event"],
          list[i]["reporter"],
          list[i]["person"],
          list[i]["person_group"],
          list[i]["image"],
          new Date().toISOString(),
        ],
        { autoCommit: true }
      );
      if (result.rowsAffected === 1) {
        insert_row++;
        results.push(result);
      } else {
        console.error(result);
      }
    }
    res.json({
      code: 1,
      message: `총 ${insert_row} 개 등록 성공. 
      시간 : ${Date.now() - start} ms.`,
      results: results,
    });
  } catch (err) {
    res.json({ code: 0, message: err.message });
  }
});
//  파일 인서틀
router.post("/insertData", async (req, res) => {
  let list = req.body.list;
  let insert_list = [],
    sql,
    start = Date.now();
  console.log(
    "no list : ",
    list.map((v) => {
      return v.id;
    })
  );
  // list.forEach((v) => {
  //   sql = `INSERT INTO CEO_ARCHIVE (no, id, item_name, created_date, create_org,
  //     task_function, education_meeting, ceo_name, report_type, region_space, region,
  //     place, army, term, term_desc, description, keyword, event,
  //     reporter, person, person_group, image) VALUES (
  //       '${v["no"]}', '${v["id"]}', '${v["item_name"]}', '${v["created_date"]}', '${v["create_org"]}',
  //       '${v["task_function"]}', '${v["education_meeting"]}', '${v["ceo_name"]}', '${v["report_type"]}', '${v["region_space"]}', '${v["region"]}',
  //       '${v["place"]}', '${v["army"]}', '${v["term"]}', '${v["term_desc"]}', '${v["description"]}', '${v["keyword"]}', '${v["event"]}',
  //       '${v["reporter"]}', '${v["person"]}', '${v["person_group"]}', '${v["image"]}'
  //     )`;
  //   insert_list.push(sql);
  // });
  try {
    let nos = list.map((v) => {
      return v.no;
    });
    let ids = list.map((v) => {
      return v.id;
    });
    let itemNames = list.map((v) => {
      return v.item_name;
    });
    let createdDates = list.map((v) => {
      return v.created_date;
    });
    let createOrgs = list.map((v) => {
      return v.create_org;
    });
    let taskFunctions = list.map((v) => {
      return v.task_function;
    });
    let educationMeetings = list.map((v) => {
      return v.education_meeting;
    });
    let ceoNames = list.map((v) => {
      return v.ceo_name;
    });
    let reportTypes = list.map((v) => {
      return v.report_type;
    });
    let regionSpaces = list.map((v) => {
      return v.region_space;
    });
    let regions = list.map((v) => {
      return v.region;
    });
    let places = list.map((v) => {
      return v.place;
    });
    let armys = list.map((v) => {
      return v.army;
    });
    let terms = list.map((v) => {
      return v.term;
    });
    let termDescs = list.map((v) => {
      return v.termDescs;
    });
    let descriptions = list.map((v) => {
      return v.description;
    });
    let keywords = list.map((v) => {
      return v.keyword;
    });
    let events = list.map((v) => {
      return v.event;
    });
    let reporters = list.map((v) => {
      return v.reporter;
    });
    let persons = list.map((v) => {
      return v.person;
    });
    let personGroups = list.map((v) => {
      return v.person_group;
    });
    let images = list.map((v) => {
      return v.image;
    });
    let connection = await oracledb.getConnection(config.conn);
    connection.execute(
      `
        declare
          type number_no is table of number
            index by pls_integer;
          type varchar2_id is table of varchar2(21)
            index by pls_integer;
          type varchar2_itemName is table of varchar2(100)
            index by pls_integer;
          type varchar2_createdDate is table of varchar2(10)
            index by pls_integer;
          type varchar2_createOrg is table of varchar2(100)
            index by pls_integer;
          type varchar2_taskFunction is table of varchar2(100)
            index by pls_integer;
          type varchar2_educationMeeting is table of varchar2(100)
            index by pls_integer;
          type varchar2_ceoName is table of varchar2(100)
            index by pls_integer;
          type varchar2_reportType is table of varchar2(100)
            index by pls_integer; 
          type varchar2_regionSpace is table of varchar2(100)
            index by pls_integer;
          type varchar2_region is table of varchar2(100)
            index by pls_integer;
          type varchar2_place is table of varchar2(100)
            index by pls_integer;
          type varchar2_army is table of varchar2(100)
            index by pls_integer;
          type varchar2_term is table of varchar2(100)
            index by pls_integer;
          type varchar2_termDesc is table of varchar2(1000)
            index by pls_integer;
          type varchar2_description is table of varchar2(4000)
            index by pls_integer;
          type varchar2_keyword is table of varchar2(100)
            index by pls_integer; 
          type varchar2_event is table of varchar2(100)
            index by pls_integer;
          type varchar2_reporter is table of varchar2(1000)
            index by pls_integer;
          type varchar2_person is table of varchar2(1000)
            index by pls_integer;
          type varchar2_personGroup is table of varchar2(1000)
            index by pls_integer;
          type varchar2_image is table of varchar2(1000)
            index by pls_integer;

          l_nos number_no := :nos;
          l_ids varchar2_id := :ids;
          l_itemNames varchar2_itemName := :itemNames;
          l_createdDates varchar2_createdDate := :createdDates;
          l_createOrgs varchar2_createOrg := :createOrgs;
          l_taskFunctions varchar2_taskFunction := :taskFunctions;
          l_educationMeetings varchar2_educationMeeting := :educationMeetings;
          l_ceoNames varchar2_ceoName := :ceoNames;
          l_reportTypes varchar2_reportType := :reportTypes;
          l_regionSpaces varchar2_regionSpace := :regionSpaces;
          l_regions varchar2_region := :regions;
          l_places varchar2_place := :places;
          l_armys varchar2_army := :armys;
          l_terms varchar2_term := :terms;
          l_termDescs varchar2_termDesc := :termDescs;
          l_descriptions varchar2_description := :descriptions;
          l_keywords varchar2_keyword := :keywords;
          l_events varchar2_event := :events;
          l_reporters varchar2_reporter := :reporters;
          l_persons varchar2_person := :persons;
          l_personGroups varchar2_personGroup := :personGroups;
          l_images varchar2_image := :images;

        begin
          forall x in l_nos.first .. l_nos.last
            insert into CEO_ARCHIVE (
              no, id, item_name, created_date, create_org, 
              task_function, education_meeting, ceo_name, report_type, region_space, 
              region, place, army, term, term_desc, 
              description, keyword, event, reporter, person, 
              person_group, image
            ) values (
              l_nos(x), l_ids(x), l_itemNames(x), l_createdDates(x), l_createOrgs(x), l_taskFunctions(x),
              l_educationMeetings(x), l_ceoNames(x), l_reportTypes(x), l_regionSpaces(x), l_regions(x), l_nos(x),
              l_places(x), l_armys(x), l_terms(x), l_termDescs(x), l_descriptions(x), l_keywords(x),
              l_events(x), l_reporters(x), l_persons(x), l_personGroups(x), l_images(x)
            );
        end;
      `,
      {
        nos: {
          type: oracledb.NUMBER,
          dir: oracledb.BIND_IN,
          val: nos,
        },
        ids: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: ids,
        },
        itemNames: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: itemNames,
        },
        createdDates: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: createdDates,
        },
        createOrgs: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: createOrgs,
        },
        taskFunctions: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: taskFunctions,
        },
        educationMeetings: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: educationMeetings,
        },
        ceoNames: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: ceoNames,
        },
        reportTypes: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: reportTypes,
        },
        regionSpaces: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: regionSpaces,
        },
        regions: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: regions,
        },
        places: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: places,
        },
        armys: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: armys,
        },
        terms: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: terms,
        },
        termDescs: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: termDescs,
        },
        descriptions: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: descriptions,
        },
        keywords: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: keywords,
        },
        events: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: events,
        },
        reporters: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: reporters,
        },
        persons: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: persons,
        },
        personGroups: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: personGroups,
        },
        images: {
          type: oracledb.STRING,
          dir: oracledb.BIND_IN,
          val: images,
        },
      },
      {
        autoCommit: true,
      },
      function (err) {
        if (err) {
          console.error(err);
          return;
        }
        console.log(
          "success. Inserted " +
            list.length +
            " rows in " +
            (Date.now() - start) +
            " ms."
        );
      }
    );
    // let result = await connection.execute(insert_list.join(";"));
    // res.json({ code: 1, message: "등록 성공", result: result });
    res.end();
  } catch (err) {
    res.json({ code: 0, message: err.message, sql: insert_list.join(";") });
  }
});
module.exports = router;
