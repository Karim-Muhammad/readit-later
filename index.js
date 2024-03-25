#!/usr/bin/env node

import express from "express";
import nunjucks from "nunjucks";
import articlesRouter from "./routes/articles.js";

const app = express();
app.set("port", process.env.PORT || 3001);

nunjucks.configure(`${process.cwd()}/resources/views`, {
  autoescape: true,
  noCache: true,
  express: app,
});

app.engine("njk", nunjucks.render);
app.set("view engine", "njk");

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Static
app.use(express.static(`public`));

process.on("uncaughtException", (er) => {
  console.log("Uncaught Exception ", er);
});

app.use("/", articlesRouter);

app.listen(app.get("port"), () => {
  console.log(
    `The Server is Listening on ${app.get(
      "port"
    )}, visit: http://localhost:${app.get("port")}`
  );
});
