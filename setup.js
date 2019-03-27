require('dotenv').config();

const fs = require('fs');
const util = require('util');
const faker = require('faker');

const { query } = require('./db');
const { uploadImage } = require('./cloud');

const connectionString = process.env.DATABASE_URL;
const numOfCategories = 12;
const numOfProducts = 1001;

const readFileAsync = util.promisify(fs.readFile);

async function insertCategories() {
  let title = '';
  for (let i = 0; i < numOfCategories; i += 1) {
    let result = { rowCount: 1 };
    while (result.rowCount > 0) {
      title = faker.commerce.department();
      const q1 = `
        SELECT * FROM
        categories
        WHERE title = $1
      `;
      result = await query(q1, [title]); // eslint-disable-line
    }
    const q2 = `
      INSERT INTO
      categories (title)
      VALUES ($1)
    `;
    await query(q2, [title]); // eslint-disable-line
  }
}

async function uploadImages() {
  const fylki = [];
  for (let i = 1; i < 21; i += 1) {
    const imgPath = './img/img' + String(i) + '.jpg'; // eslint-disable-line
    const cloudPath = await uploadImage(imgPath); // eslint-disable-line
    fylki.push(cloudPath);
  }
  return fylki;
}

async function insertProducts() {
  let title = '';
  const cloudPaths = await uploadImages();
  for (let i = 0; i < numOfProducts; i += 1) {
    let result = { rowCount: 1 };
    while (result.rowCount > 0) {
      title = faker.commerce.productName();
      const q1 = `
        SELECT * FROM
        products
        WHERE title = $1
      `;
      result = await query(q1, [title]); // eslint-disable-line
    }

    const price = faker.commerce.price();
    const descr = faker.lorem.paragraphs();
    const imgID = Math.floor(Math.random() * 20);

    const randomCategory = Math.floor(Math.random() * numOfCategories) + 1;
    const q2 = 'SELECT title FROM categories WHERE id = $1';
    const categoryResult = await query(q2, [randomCategory]); // eslint-disable-line
    const category = categoryResult.rows[0].title;

    const q3 = `
      INSERT INTO 
      products (title, price, descr, img, category)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await query(q3, [title, price, descr, cloudPaths[imgID], category]); // eslint-disable-line
  }
}

async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflu ef til
  await query('DROP TABLE IF EXISTS incart');
  await query('DROP TABLE IF EXISTS carts');
  await query('DROP TABLE IF EXISTS users');
  await query('DROP TABLE IF EXISTS products');
  await query('DROP TABLE IF EXISTS categories');
  console.info('Töflum eytt');

  // búa til töflur út frá skema
  try {
    const createTable = await readFileAsync('./sql/schema.sql');
    await query(createTable.toString('utf8'));
    console.info('Tafla búnin til');
  } catch (e) {
    console.error('Villa við að búa til töflur:', e.message);
    return;
  }

  // bæta færslum við töflur
  try {
    const insert = await readFileAsync('./sql/insert.sql');
    await query(insert.toString('utf8'));
    await insertCategories();
    console.info('Gögnum bætt við í flokkstöflu');
    await insertProducts();
    console.info('Gögnum bætt við í vörutöflu');
  } catch (e) {
    console.error('Villa við að bæta gögnum við:', e.message);
  }
}

main().catch(err => { // eslint-disable-line
  console.error(err);
});
