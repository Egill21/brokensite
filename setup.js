require('dotenv').config();

const fs = require('fs');
const util = require('util');

const { query } = require('./db');

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
    console.info('Gögnum bætt við');
  } catch (e) {
    console.error('Villa við að bæta gögnum við:', e.message);
  }
}

main().catch(err => {
  console.error(err);
});
