import Sqlite3 from "sqlite3";

const sqlite3 = Sqlite3.verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS articles (id INTEGER primary key AUTOINCREMENT, title varchar(255), content TEXT, link varchar(255))"
  );
});

export default db;
