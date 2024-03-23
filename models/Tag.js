import db from "./../database/setup.js";

export default class Tag {
  static all(cb) {
    db.all("SELECT * FROM tags", cb);
  }

  static find(id, cb) {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM tags WHERE article_id = ?", +id, (err, res) => {
        if (err) reject(err);

        return resolve(res);
      });
    });
  }

  static create(data, cb) {
    db.run(
      "INSERT INTO tags (name, article_id) VALUES (?, ?)",
      data.name,
      data.article_id,
      cb
    );
  }

  static delete(id, cb) {
    db.run("DELETE FROM tags where id = (?)", id, cb);
  }
}
