// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const assert = require("assert");
const { chromium } = require("playwright");
const { firefox } = require("playwright");


async function validateHackerNewsArticles() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized']
  });

  // const browser = await firefox.launch({
  //   headless: false
  // });

  const context = await browser.newContext({
    viewport: null
  });
  const page = await context.newPage();

  // Using following 3 lines only for Firefox
  // const screenWidth = await page.evaluate(() => window.screen.width);
  // const screenHeight = await page.evaluate(() => window.screen.height);
  // await page.setViewportSize({ width: screenWidth, height: screenHeight });


  await page.goto("https://news.ycombinator.com/newest");

  let articles = [];

  while (articles.length < 100) {
    // Extract both rows (the title row and the next sibling row)
    const pageArticles = await page.$$eval('tr.athing', (rows) => {
      return rows.map(row => {
        // Find the next row, which contains the article metadata
        const nextRow = row.nextElementSibling;
        if (!nextRow) {
          console.log("Missing metadata row for article");
          return null;
        }

        // Find the age element in the second row
        const ageElement = nextRow.querySelector('.age');
        if (!ageElement) {
          console.log("Missing age element for article");
          return null;
        }

        // Extract the date from the title attribute in <span>
        const ageTitle = ageElement.getAttribute('title');
        if (!ageTitle) {
          console.log("Missing title attribute in .age element");
          return null;
        }
        
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

  // Debugging: Log all the extracted article data
  console.log("Extracted article dates:", articles);

  let isSorted = true;
  for (let i = 0; i < articles.length-1; i++) {
    const currentArticleDate = new Date(articles[i].age);
    const nextArticleDate = new Date(articles[i+1].age);

    // Debugging: Log each comparison along with the raw extracted values
    console.log(`Comparing article ${i+1} date: ${articles[i].age} (current) with article ${i+2} date: ${articles[i+1].age} (next)`);

    if (isNaN(currentArticleDate.getTime()) || isNaN(nextArticleDate.getTime())) {
      console.log(`Invalid date encountered at article ${i+1}:`, articles[i].age, articles[i+1].age);
      isSorted = false;
      break;
    }

    if (currentArticleDate < nextArticleDate) {
      isSorted = false;
      console.log(`Articles are not sorted correctly: Article ${i+1} is older than article ${i+2}`);
      break;
    }
  }

  // Use assert to check if the articles are sorted correctly
  try {
    assert.strictEqual(isSorted, true, "Articles are not sorted correctly");
    console.log("The first 100 articles are correctly sorted from newest to oldest!");
  } catch (error) {
    console.error(error.message);
  }

  await browser.close();
}

(async () => {
  await validateHackerNewsArticles();
})();
