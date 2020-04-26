const CUBRID = require("node-cubrid"); // node-cubrid 모듈 불러오기
var poolModule = require("generic-pool");

const dbConf = {
  // DB 정보 설정
  host: "localhost",
  port: 30000,
  user: "dba",
  password: "alsdud1218!",
  database: "roka_db"
};

(async function main() {
  var pool = await poolModule.Pool({
    name: "CUBRID",
    // connection은 최대 10개까지 생성합니다.
    max: 10,
    // 생성된 connection은 30초 동안 유휴 상태(idle)면 destory됩니다.
    idleTimeoutMillis: 30000,
    log: true,
    create: function(callback) {
      var conn = CUBRID.createCUBRIDConnection(
        "localhost",
        33000,
        "dba",
        "password",
        "demodb"
      );
      conn.connect(function(err) {
        callback(err, conn);
      });
    },
    destroy: function(con) {
      conn.close();
    }
  });
});
