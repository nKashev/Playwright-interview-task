const { test, expect } = require('@playwright/test');

test('Validate that Hacker News articles are sorted correctly', async ({ page }) => {
  // Go to the "newest" page of Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  let articles = [];

  while (articles.length < 100) {
    // Extract the articles
    const pageArticles = await page.$$eval('tr.athing', (rows) => {
      return rows.map(row => {
        const nextRow = row.nextElementSibling;
        const ageElement = nextRow.querySelector('.age');
        const ageTitle = ageElement.getAttribute('title');
        return { age: ageTitle };
      }).filter(article => article !== null);
    });

    articles = articles.concat(pageArticles);

    if (articles.length >= 100) break;

    const nextButton = await page.$('a.morelink');
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    } else {
      break;
    }
  }

  articles = articles.slice(0, 100);

  // Check if articles are sorted from newest to oldest
  let isSorted = true;
  for (let i=0; i < articles.length-1; i++) {
    const currentArticleDate = new Date(articles[i].age);
    const nextArticleDate = new Date(articles[i+1].age);

    if (isNaN(currentArticleDate.getTime()) || isNaN(nextArticleDate.getTime())) {
      isSorted = false;
      break;
    }

    if (currentArticleDate < nextArticleDate) {
      isSorted = false;
      break;
    }
  }

  // Assert that articles are sorted correctly
  expect(isSorted).toBe(true, "The articles are not sorted correctly!");
});
