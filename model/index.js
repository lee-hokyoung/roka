const oracledb = require("oracledb");

module.exports = () => {
  const connect = () => {
    oracledb.getConnection(
      {
        user: process.env.oracleUser,
        password: process.env.oraclePW,
        connectString: process.env.oracleConnectString,
      },
      (error) => {
        if (error) console.log("디비 연결 에러", error);
        else console.log("디비 연결 성공");
      }
    );
  };
  connect();
};
