import Tag from "./../models/Tag.js";

export async function getWithTags(articles) {
  try {
    const tagPromises = articles.map(async (article) => {
      const tags = await Tag.find(article.id);
      article.tags = tags.map((tag) => tag.name);
    });

    await Promise.all(tagPromises);

    return articles;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
