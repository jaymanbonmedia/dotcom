import { Client } from "@notionhq/client";
import { mkdirSync, writeFileSync } from "fs";

// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const homePageId = process.env.NOTION_HOME_PAGE_ID!

async function fetchAllPages() {
  let hasMore = true;
  let cursor = undefined;
  const pages: any[] = [];

  while (hasMore) {
    const response = await notion.search({
      query: '', // Empty query returns all objects
      start_cursor: cursor as any,
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    pages.push(...response.results);
    cursor = response.next_cursor;
    hasMore = response.has_more;
  }

  return pages.map(page => ({
    id: page.id.replace(/-/g, ''),
    title: page.id == homePageId ? '' : page.properties?.title?.title[0]?.plain_text || 'Untitled',
  }));
}

async function mapPagesToSlugs() {
  const pages = await fetchAllPages();
  const pageMap = pages.reduce((acc, page) => {
    acc[page.id] = slugify(page.title);
    return acc;
  }, {} as Record<string, string>);

  mkdirSync('src/data', { recursive: true });

  writeFileSync('src/data/pageMap.json', JSON.stringify(pageMap, null, 2));

  console.log(JSON.stringify(pageMap, null, 2));

  const astroPages = pages.map((page) => {
    return {
      id: page.id,
      slug: slugify(page.title),
      title: page.title,
    };
  }).filter(page => page.slug !== ''); // Don't need a page for the home page

  console.log(JSON.stringify(astroPages, null, 2));

  writeFileSync('src/data/pages.json', JSON.stringify(astroPages, null, 2));
}


function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}


mapPagesToSlugs().then(() => console.log('done'));



