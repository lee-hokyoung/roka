const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const config = require("../config");

const path = require("path");
const multer = require("multer");
const fs = require("fs");

// 게시판 리스트
router.get("/list/:board_type", async (req, res) => {
  let connection;
  try {
    let tbl_name = req.params.board_type;
    let title = tbl_name === "notice" ? "공지사항" : tbl_name === "faq" ? "FAQ" : "사여단 Q&A";
    connection = await oracledb.getConnection(config.conn);
    let sql = `SELECT * FROM board_${tbl_name} `;
    let list = await connection.execute(sql);
    res.render("board", {
      title: title,
      active: tbl_name,
      list: list,
    });
  } catch (err) {
    console.error(err);
    res.end();
  }
});
router.get("/write/:board_type", async (req, res) => {
  let tbl_name = req.params.board_type;
  let title = tbl_name === "notice" ? "공지사항" : tbl_name === "faq" ? "FAQ" : "사여단 Q&A";
  res.render("board_write", {
    title: title,
    active: tbl_name,
  });
});
// 공지사항 글 등록
router.post("/write/:board_type", async (req, res) => {
  let connection;
  try {
    let tbl_name = req.params.board_type;
    connection = await oracledb.getConnection(config.conn);
    let sql = `
      INSERT INTO board_${tbl_name} (id, title, writer, content, created_at) 
      VALUES (:0, :1, :2, :3, :4) `;
    let result = await connection.execute(sql, [
      Date.now().toString(16),
      req.body.title,
      req.body.writer,
      req.body.content,
      new Date().toISOString(),
    ]);
    if (result.rowsAffected === 1) {
      res.json({ code: 1, message: "등록 성공" });
    } else {
      res.json({ code: 0, message: "등록 실패, 관리자에게 문의해 주세요" });
    }
  } catch (err) {
    res.json({ code: 0, message: err.message });
  }
});
// 게시판 이미지 업로드
const upload = multer({
  storage: multer.diskStorage({
    // 저장할 폴더 지정
    destination: (req, file, cb) => {
      cb(null, "temps/");
    },
    filename: (req, file, cb) => {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }),
});

router.post("/upload/image", upload.single("upload"), async (req, res) => {
  console.log("file : ", req.file);
  let file = req.file;
  res.json({ url: path.delimiter + file.path });
});
module.exports = router;
