exports.conn = {
  user: process.env.oracleUser,
  password: process.env.oraclePW,
  connectString: process.env.oracleConnectString,
};
exports.table = (req) => {
  let title = req.params.title,
    tbl_name;
  switch (title) {
    case "총장결재기록물":
      tbl_name = "CEO_ARCHIVE";
      break;
    case "정책기록":
      tbl_name = "POLICY_ARCHIVE";
      break;
    case "전투기록":
      tbl_name = "WAR_ARCHIVE";
      break;
    case "사여단기록":
      tbl_name = "GROUP_ARCHIVE";
      break;
  }
  return tbl_name;
};
