const { paged, query, conditionalUpdate } = require('../../db');
const { getProductById } = require('../products/productsUtils');
const xss = require('xss');

// Nota með cartRoute() í cart.js
async function getCart(userId) {
  const temp = await isCart(userId);
  /* let q = `
    SELECT *
    FROM carts
    WHERE userid = $1
    `;

  const result = await query(q, [userId]);
  console.log(result); */
  console.log(temp);
  if (!temp.available) {
    return {
      error: temp.error
    };
  }
  const cartId = temp.id;
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

async function getCartLine(userid, lineid) {}

// Reiknar út summu fylkja
const calculatePrice = arr => arr.reduce((a, b) => a + b, 0);

async function getPrice(productid, amount) {
  const product = await getProductById(productid);
  return product.price * amount;
}

// Nota með cartPostRoute() í cart.js
async function addToCart(userid, productid, amount) {
  const temp = await isCart(userid);

  let cartid;
  if (!temp.available) {
    cartid = await createCart(userid);
  } else {
    cartid = temp.id;
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
  const temp = await isCart(userid);

  if (!temp.available) {
    return {
      error: 'You dont have anything in your cart'
    };
  }

  const cartid = temp.id;

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
  const cartid = await isCart(userid);
  if (!cartid.available) {
    return {
      error: cartid.error
    };
  }
  const canDelete = await deleteCartIfEmpty(userid, cartid.id);

  if (!canDelete) {
    return {
      error: await getCart(userid)
    };
  }
  const q = `
  DELETE FROM incart
  WHERE 
  id = $1
  AND
  cartid = $2
  `;
  await query(q, [id, cartid.id]);

  await deleteCartIfEmpty(userid, cartid.id);

  const cart = await getCart(userid);

  return cart;
}

async function createCart(userId) {
  const q = 'INSERT INTO carts(userid) VALUES($1) RETURNING *';
  const result = await query(q, [userId]);
  return result.rows[0].id;
}

async function isCart(userid) {
  const check = `
    SELECT * FROM
    carts 
    WHERE userid = $1 AND 
    isorder = '0'`;

  const result = await query(check, [userid]);

  if (result.rows.length === 0) {
    return {
      available: false,
      error: 'You dont have anything in your cart'
    };
  }

  return {
    id: result.rows[0].id,
    available: true
  };
}

async function deleteCartIfEmpty(userid, cartId) {
  const q = `
        SELECT *
        FROM incart
        WHERE cartid = $1
    `;
  const result = await query(q, [cartId]);
  console.log(result);
  if (!(result.rows.length === 0)) {
    return true;
  }
  const deleteQ = `
        DELETE FROM carts
        WHERE userid = $1
        AND isorder = '0'
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
