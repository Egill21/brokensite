const { paged, query, conditionalUpdate } = require('../../db');
const { getProductById } = require('../products/productsUtils');
const xss = require('xss');

// Nota með cartRoute() í cart.js
async function getCart(userId) {
  const values = [];
  let q = `
    SELECT *
    FROM carts
    WHERE userid = $1
    `;
  const result = await query(q, [userId]);
  if (!result.rows) {
    return null;
  }
  const cartId = result.rows[0].id;
  const q2 = `
    SELECT * 
    FROM incart
    WHERE cartid = $1 
  `;
  const result2 = await query(q2, [cartId]);
  const products = result2.rows;
  let price = [];
  for (let i = 0; i < products.length; i++) {
    const amount = products[i].amount;
    const productid = products[i].productid;
    price.push(await getPrice(productid, amount));
  }
  const fullPrice = calculatePrice(price);
  products.fullprice = fullPrice;

  return products;
}

// Reiknar út summu fylkja
const calculatePrice = arr => arr.reduce((a, b) => a + b, 0);

async function getPrice(productid, amount) {
  const product = await getProductById(productid);
  return product.price * amount;
}

// Nota með cartPostRoute() í cart.js
async function addToCart(userid, productid, amount) {
  let cartid;
  const check = `
        SELECT id FROM
        carts 
        WHERE userid = $1 AND 
        isorder = '0'`;
  const result = await query(check, [userid]);

  console.log(userid);
  if (result.rows.length === 0) {
    cartid = await createCart(userid);
  } else {
    cartid = result.rows[0].id;
  }

  const q = `
        INSERT INTO
        incart(cartid, productid, amount)
        VALUES($1,$2,$3)
        RETURNING *
    `;
  const cart = await query(q, [xss(cartid), xss(productid), xss(amount)]);
  return cart.rows[0];
}

async function createCart(userId) {
  const q = 'INSERT INTO carts(userid) VALUES($1)';
  await query(q, [userId]);
}

module.exports = {
  getCart,
  addToCart
};
