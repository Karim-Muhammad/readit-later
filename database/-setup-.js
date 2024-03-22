import sqlite3 from "sqlite3";
sqlite3.verbose();

import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./tmp/database.db",
    driver: sqlite3.Database,
  });

  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS articles (id integer primary key, title varchar(255), content TEXT)`
    );
  });

  db.close();
})();

function openDb() {
  return open({
    filename: "./tmp/database.db",
    driver: sqlite3.Database,
  });
}

export default openDb;
