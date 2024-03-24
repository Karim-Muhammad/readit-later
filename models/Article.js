import db from "../database/setup.js";
import Tag from "./Tag.js";

export default class Article {
  static all(cb) {
    db.all("SELECT * FROM articles", cb);
  }

  static find(id, cb) {
    const stmt = db.prepare("SELECT * FROM articles WHERE id = ?");
    stmt.get([+id], cb);
  }

  static search(query, cb) {
    db.all(
      "SELECT * FROM articles WHERE title LIKE ? OR description LIKE ?",
      [`%${query}%`, `%${query}%`],
      function (err, rows) {
        console.log(rows);

        if (err) return cb(err, null);
        if (!rows.length) {
          // Search by tags
          return db.all(
            "SELECT * FROM articles WHERE id IN (SELECT article_id FROM tags WHERE name LIKE ?)",
            [`%${query}%`],
            cb
          );
        }

        cb(null, rows);
      }
    );
  }

  static create(data, cb) {
    db.run(
      "INSERT INTO articles (image, title, description, content, link) VALUES (?, ?, ?, ?, ?)",
      [data.image, data.title, data.description, data.content, data.link],
      function (err) {
        if (err) console.log(err);

        console.log(this);
        console.log("Article inserted with id:", this.lastID);

        // Insert tags
        data.tags.forEach((tag) => {
          Tag.create(
            {
              name: tag.trim(),
              article_id: this.lastID,
            },
            (err) => {
              if (err) console.log(err);

              console.log("Tag inserted with id:", this.lastID);
            }
          );
        });

        cb(err, this);
      }
    );
  }

  static delete(id, cb) {
    db.run("DELETE FROM articles where id = (?)", id, cb);
  }
}
