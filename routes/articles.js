import express from "express";
import puppeteer, { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import Article from "./../models/Article.js";
import { getWithTags } from "../utils/index.js";
// import Tag from "./../models/Tag.js";

const router = express.Router();
router.get("/", (req, res) => {
  res.render("index.njk");
});

router.get("/articles/form", (req, res) => {
  res.render("post-article.njk");
});

router.get("/articles", (req, res, next) => {
  Article.all(async (err, data) => {
    if (err) console.log(err);

    const articles = await getWithTags(data);
    console.log("articles", articles);

    res.render("articles.njk", {
      articles,
    });
  });
});

router.get("/articles/:id", (req, res, next) => {
  Article.find(req.params.id, (error, result) => {
    if (error) return next(error);

    if (!result) return res.status(404).send("Article Not Found");

    res.render("article.njk", {
      article: result,
    });
  });
});

router.post("/articles", async (req, res, next) => {
  const webURL = req.body.url;
  const tags = req.body.tags.split(",");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(webURL);

  page.on("console", (msg) => {
    console.log("Page console log:", msg.text());
  });

  const extractedHtml = await page.evaluate(() => {
    // replace all href to make them start with https hostname (as absolute path)
    const aTags = document.getElementsByTagName("a");
    const links = document.getElementsByTagName("link");
    Array.from(aTags).forEach((a) => {
      if (
        a &&
        !a.getAttribute("href")?.startsWith("http") &&
        !a.getAttribute("href")?.startsWith("#")
      ) {
        a.setAttribute("href", new URL(a.href, document.baseURI).href);
      }
      console.log(a.getAttribute("href"));
    });

    Array.from(links).forEach((link) => {
      if (
        link &&
        !link.getAttribute("href")?.startsWith("http") &&
        !link.getAttribute("href")?.startsWith("#")
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
        !image.getAttribute("src")?.startsWith("http") &&
        !image.getAttribute("src")?.startsWith("#")
      ) {
        image.setAttribute("src", new URL(image.src, document.baseURI).href);
      }
      console.log(image.getAttribute("src"));
    });

    const scripts = document.getElementsByTagName("script");
    Array.from(scripts).forEach((script) => {
      script.remove();
    });

    const meta = document.getElementsByTagName("meta");
    Array.from(meta).forEach((m) => {
      if (
        !m?.getAttribute("name") === "viewport" &&
        !m?.getAttribute("name") === "description" &&
        !m?.getAttribute("name") === "keywords"
      ) {
        m.remove();
      }
    });

    // no reflect all my previous actions on this outerHtml
    return document.documentElement.outerHTML;
  });

  // Title of web page
  const title = await page.title();

  // Link of the web page
  const link = webURL;

  // image of the web page
  const imageForArticle = await page.evaluate(() => {
    const images = document.getElementsByTagName("img");
    return images[1]?.src;
  });

  // description of the web page
  const description = await page.evaluate(() => {
    return document.querySelector("meta[name='description']")?.content;
  });

  Article.create(
    {
      image: imageForArticle,
      content: extractedHtml,
      title,
      description,
      link,
      tags,
    },
    (error, result) => {
      if (error) return next(error);

      res.redirect("/articles");
    }
  );
});

router.delete("/articles/:id", (req, res, next) => {
  articles.splice(req.params.id, 1);
  res.send("Deleted Successfully");
});

export default router;
