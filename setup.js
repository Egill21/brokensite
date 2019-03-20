require('dotenv').config();

const fs = require('fs');
const util = require('util');
const faker = require('faker');

const { query } = require('./db');
const { uploadImage } = require('./cloud');

const connectionString = process.env.DATABASE_URL;

const readFileAsync = util.promisify(fs.readFile);

async function main() {
  console.info(`Set upp gagnagrunn á ${connectionString}`);
  // droppa töflu ef til
  await query('DROP TABLE IF EXISTS inorder');
  await query('DROP TABLE IF EXISTS orders');
  await query('DROP TABLE IF EXISTS products');
  console.info('Products eytt');
  await query('DROP TABLE IF EXISTS users');
  console.info('Categories eytt');
  await query('DROP TABLE IF EXISTS categories');
  console.info('Users eytt');
  console.info('Orders eytt');
  console.info('Inorder eytt');

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
    await insertProducts();
    console.info('Gögnum bætt við');
  } catch (e) {
    console.error('Villa við að bæta gögnum við:', e.message);
  }
}

async function insertProducts() {
  // insert title, price, desc, (img?), category
  Math.floor(Math.random() * 10);

  let title = '';
  for (let i = 0; i < 100; i++) {
    let result = { rowCount: 1, }
    while (result.rowCount > 0) {
      title = faker.commerce.productName();
      const q1 = `
        SELECT * FROM
        products
        WHERE title = $1
      `;
      result = await query(q1, [title]);
    }

    // console.log(title);
    const price = faker.commerce.price();
    // console.log(price);
    const descr = faker.lorem.paragraphs();
    // console.log(descr);
    const category = faker.commerce.department();
    // console.log(category);
    const imgID = Math.floor(Math.random() * 20) + 1;
    const imgPath = './img/img' + String(imgID) + '.jpg';
    const cloudPath = await uploadImage(imgPath);
  
    const q2 = `
      INSERT INTO 
      products (title, price, descr, img, category)
      VALUES ($1, $2, $3, $4, $5)
    `;
  
    await query(q2, [title, price, descr, cloudPath, category]);
  }
}

main().catch(err => {
  console.error(err);
});
