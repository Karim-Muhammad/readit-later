import Sqlite3 from "sqlite3";

const sqlite3 = Sqlite3.verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS articles (
      id INTEGER primary key AUTOINCREMENT,
      image varchar(255),
      title varchar(255),
      description varchar(255),
      content TEXT,
      link varchar(255)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS tags (
      id INTEGER primary key AUTOINCREMENT,
      name varchar(255),
      article_id INTEGER,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )`
  );
});

export default db;
