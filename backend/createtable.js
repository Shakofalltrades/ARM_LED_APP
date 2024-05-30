var sql = "CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY, frame BLOB)";
con.query(sql, function (err, result) {
  if (err) throw err;
  console.log("Table created");
});