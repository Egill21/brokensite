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
  if (result.rows.length === 0) {
    return {
      error: 'You dont have anything in your cart'
    };
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
  let pros = [];
  for (let i = 0; i < products.length; i++) {
    const amount = products[i].amount;
    const productid = products[i].productid;
    price.push(await getPrice(productid, amount));
    let temp = await getProductById(productid);
    pros.push({
      id: products[i].id,
      product: temp.title,
      amount: amount
    });
  }
  const fullPrice = calculatePrice(price);

  pros.push({ fullprice: fullPrice });

  return pros;
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

async function changeAmount(userid, id, amount) {
  const check = `
        SELECT * FROM
        carts 
        WHERE userid = $1 AND 
        isorder = '0'`;
  const result = await query(check, [userid]);

  if (result.rows.length === 0) {
    return {
      error: 'You dont have anything in your cart'
    };
  }

  const cartid = result.rows[0].id;

  const q = `
        UPDATE incart
        SET amount = $1
        WHERE id = $2 AND cartid = $3
        RETURNING *
  `;
  const result2 = await query(q, [amount, id, cartid]);

  if (result2.rows.length === 0) {
    return {
      error: 'There is no product in your cart with that ID'
    };
  }
  const product = await getProductById(result2.rows[0].productid);
  const boi = {
    product: product.title,
    amount: result2.rows[0].amount
  };
  return boi;
}

async function deleteCartItem(userid, id) {
  const check = `
    SELECT * FROM
    carts 
    WHERE userid = $1 AND 
    isorder = '0'`;
  const result = await query(check, [userid]);

  if (result.rows.length === 0) {
    return {
      error: 'You dont have anything in your cart'
    };
  }
  const cartid = result.rows[0].id;
  const canDelete = await deleteCartIfEmpty(userid, cartid);
  if (!canDelete) {
    return {
      error: 'You dont have anything in your cart'
    };
  }
  const q = `
  DELETE FROM incart
  WHERE 
  id = $1
  AND
  cartid = $2
  `;
  await query(q, [id, cartid]);

  const cart = await getCart(userid);

  return cart;
}

async function createCart(userId) {
  const q = 'INSERT INTO carts(userid) VALUES($1) RETURNING *';
  const result = await query(q, [userId]);
  return result.rows[0].id;
}

async function deleteCartIfEmpty(userid, cartId) {
  const q = `
        SELECT *
        FROM incart
        WHERE cartid = $1
    `;
  const result = await query(q, [cartId]);
  if (!(result.rows.length === 0)) {
    return true;
  }
  const deleteQ = `
        DELETE FROM carts
        WHERE userid = $1
    `;
  await query(deleteQ, [userid]);

  return false;
}

module.exports = {
  getCart,
  addToCart,
  changeAmount,
  deleteCartItem
};
