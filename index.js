import express from "express";
import axios from "axios";
import { load } from "cheerio";
import nunjucks from "nunjucks";
import Article from "./models/Articles.js";

const app = express();
app.set("port", process.env.PORT || 3000);

nunjucks.configure(`${process.cwd()}/views`, {
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

process.on("uncaughtException", (er) => {
  console.log("Uncaught Exception ", er);
});

app.get("/", (req, res) => {
  res.render("index.njk");
});
app.get("/articles/form", (req, res) => {
  res.render("post-article.njk");
});

app.get("/articles", (req, res, next) => {
  Article.all((err, data) => {
    if (err) console.log(err);

    res.render("articles.njk", {
      articles: data,
    });
  });
});

app.get("/articles/:id", (req, res, next) => {
  Article.find(req.params.id, (error, result) => {
    if (error) return next(error);

    res.render("article.njk", {
      article: result,
    });
  });
});

app.post("/articles", async (req, res, next) => {
  const webURL = req.body.url;
  const webPageResponse = await axios.get(webURL);
  const html = webPageResponse.data;

  // Hostname
  const { origin: host, href: link } = new URL(webPageResponse.config.url);

  // Extract HTML
  const $ = load(html);
  let extractedHtml = $.html();

  // Title of web page
  const title = $("head > title").text();

  // Avoid Extracting JS
  $("script").remove();
  $("noscript").remove();
  $("meta").remove();

  // Update extractedHtml
  extractedHtml = $.html();

  // Extracted CSS
  const css = [];
  $("[rel=stylesheet]").each((index, elm) => {
    // elm.href `https://nodejs.org/${elm}`

    // console.log(host);

    // if (!$(elm).attr("href").startsWith(host)) {
    //   css.push(`${host}/${$(elm).attr("href")}`);
    // } else {
    //   css.push(`${$(elm).attr("href")}`);
    // }

    const element = $(elm);
    // I want to change the href attribute of the element to make them start with the host
    extractedHtml = extractedHtml.replace(
      element.attr("href"),
      `${host}/${element.attr("href")}`
    );
  });

  Article.create(
    {
      title: title,
      content: extractedHtml,
      link: link,
    },
    (error, result) => {
      if (error) return next(error);

      res.redirect("/articles");
    }
  );
});

app.delete("/articles/:id", (req, res, next) => {
  articles.splice(req.params.id, 1);
  res.send("Deleted Successfully");
});

app.listen(app.get("port"), () => {
  console.log(`The Server is Listening on ${app.get("port")}`);
});

app.use((er, req, res, next) => {
  if (er) {
    console.log(`ERROR Catch ${er}`);
  }
});
