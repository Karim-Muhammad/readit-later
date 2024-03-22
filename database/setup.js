import Sqlite3 from "sqlite3";

const sqlite3 = Sqlite3.verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS articles (id INTEGER primary key AUTOINCREMENT, title varchar(255), content TEXT, link varchar(255))"
  );

  // =============== SEEDERS
  // const stmt = db.prepare(
  //   "INSERT INTO articles VALUES (NULL, :title, :content)"
  // );
  // for (let i = 0; i < 10; i++) {
  //   stmt.run(
  //     {
  //       ":title": "Title " + i,
  //       ":content": "Content " + i,
  //     },
  //     (res, err) => {
  //       if (err) console.log(err);
  //       console.log(res);
  //     }
  //   );
  // }
  // stmt.finalize();

  // ===================== Display
  // db.each("SELECT id, title FROM articles", (err, row) => {
  //   console.log(row.id + ": " + row.title);
  // });
});

export default db;
