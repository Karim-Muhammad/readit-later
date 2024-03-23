import express from "express";
// import axios from "axios";
// import { load } from "cheerio";
import puppeteer from "puppeteer";
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

    if (!result) return res.status(404).send("Article Not Found");

    res.render("article.njk", {
      article: result,
    });
  });
});

app.post("/articles", async (req, res, next) => {
  const webURL = req.body.url;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(webURL);
  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  page.on("console", (msg) => {
    console.log("Page console log:", msg.text());
  });

  const extractedHtml = await page.evaluate(() => {
    const page = document.documentElement.outerHTML;
    const host = new URL(document.baseURI).origin;
    // Replace all relative links with absolute links
    // page = page.replace(/href="\//g, `href="${host}/`);

    // Replace all relative src with absolute src
    // page = page.replace(/src="\//g, `src="${host}/`);

    // replace all href to make them start with https hostname (as absolute path)
    const aTags = document.getElementsByTagName("a");
    const links = document.getElementsByTagName("link");
    Array.from(aTags).forEach((a) => {
      if (
        a &&
        !a.getAttribute("href").startsWith("http") &&
        !a.getAttribute("href").startsWith("#")
      ) {
        a.setAttribute("href", new URL(a.href, document.baseURI).href);
      }
      console.log(a.getAttribute("href"));
    });

    Array.from(links).forEach((link) => {
      if (
        link &&
        !link.getAttribute("href").startsWith("http") &&
        !link.getAttribute("href").startsWith("#")
      ) {
        link.setAttribute("href", new URL(link.href, document.baseURI).href);
      }
      console.log(link.getAttribute("href"));
    });

    // replace all src to make them start with https hostname (as absolute path)
    const images = document.getElementsByTagName("img");
    Array.from(images).forEach((image) => {
      if (
        image &&
        !image.getAttribute("src").startsWith("http") &&
        !image.getAttribute("src").startsWith("#")
      ) {
        image.setAttribute("src", new URL(image.src, document.baseURI).href);
      }
      console.log(image.getAttribute("src"));
    });

    // Remove all script, meta tags
    // page = page.replace(
    //   /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    //   ""
    // );
    // page = page.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "");

    const scripts = document.getElementsByTagName("script");
    Array.from(scripts).forEach((script) => {
      script.remove();
    });

    const meta = document.getElementsByTagName("meta");
    Array.from(meta).forEach((m) => {
      m.remove();
    });

    // const meta = document.querySelectorAll("meta");
    // scripts.forEach((script) => {
    //   script.remove();
    // });
    // meta.forEach((m) => {
    //   m.remove();
    // });

    // no reflect all my previous actions on this outerHtml
    return document.documentElement.outerHTML;
  });
  // Title of web page
  const title = await page.title();

  // Link of the web page
  const link = webURL;

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
