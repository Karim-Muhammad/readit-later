import db from "../database/setup.js";

export default class Article {
  static all(cb) {
    db.all("SELECT * FROM articles", cb);
  }

  static find(id, cb) {
    const stmt = db.prepare("SELECT * FROM articles WHERE id = ?");
    stmt.get([+id], cb);
  }

  static create(data, cb) {
    db.run(
      "INSERT INTO articles (title, content, link) VALUES (?, ?, ?)",
      data.title,
      data.content,
      data.link,
      cb
    );
  }

  static delete(id, cb) {
    db.run("DELETE FROM articles where id = (?)", id, cb);
  }
}
