const { paged, query, conditionalUpdate } = require('../../db');
const { getProductById } = require('../products/productsUtils');
const xss = require('xss');

// Nota með cartRoute() í cart.js
async function getCart(userId, order) {
  let temp;
  if (!order) {
    temp = await isCart(userId);
  } else {
    temp = await getOrderByID(userId);
  }

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

async function getCartLine(userid, lineid) {
  const temp = await isCart(userid);

  if (!temp.available) {
    return {
      error: temp.error
    };
  }

  const newLineId = await getLineId(temp.id, lineid);

  if (!newLineId) {
    return {
      error: 'No line in your cart with that id'
    };
  }

  const q = `
    SELECT *
    FROM incart
    WHERE id = $1
  `;

  const line = await query(q, [newLineId]);
  const product = await getProductById(line.rows[0].productid);
  return {
    amount: line.rows[0].amount,
    product: product.title
  };
}

async function getLineId(cartid, line) {
  const q = `
        SELECT *
        FROM incart
        WHERE cartid = $1
    `;
  const lNums = await query(q, [cartid]);
  let newCartId;
  try {
    newCartId = lNums.rows[line - 1].id;
  } catch (undefined) {
    return null;
  }

  return newCartId;
}

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
  const newLineId = await getLineId(cartid, id);
  const q = `
        UPDATE incart
        SET amount = $1
        WHERE id = $2 AND cartid = $3
        RETURNING *
  `;
  const result2 = await query(q, [amount, newLineId, cartid]);

  if (result2.rows.length === 0) {
    return {
      error: 'There is no product in that line in your cart'
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
  const newLineId = await getLineId(cartid.id, id);
  const q = `
  DELETE FROM incart
  WHERE 
  id = $1
  AND
  cartid = $2
  `;
  await query(q, [newLineId, cartid.id]);

  await deleteCartIfEmpty(userid, cartid.id);

  const cart = await getCart(userid, false);

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

async function getOrderByID(id) {
  const check = `
    SELECT * FROM
    carts 
    WHERE id = $1`;

  const result = await query(check, [id]);

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

async function getOrdersUser(userId, offset) {
  const q = `
    SELECT *
    FROM carts
    WHERE userid = $1
    AND isorder = '1'
    `;
  const values = [userId];
  const result = await paged(q, { offset, values });

  return result;
}

async function getOrdersAdmin() {
  const q = `
    SELECT *
    FROM carts
    AND isorder = "1"
    `;

  const result = await query(q, [userId]);

  if (result.rows.length === 0) {
    return {
      error: 'engar pantanir bish'
    };
  }

  return result.rows;
}

async function getOrders(userId, isAdmin, offset) {
  let orders;

  if (isAdmin) {
    orders = await getOrdersAdmin(offset);
  } else {
    orders = await getOrdersUser(userId, offset);
  }

  return orders;
}

async function getOrder(id) {
  const q = `
    SELECT * FROM
    carts
    WHERE isorder = '1'
    AND id = $1
  `;
  const result = await query(q, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  const result2 = await getCart(id, true);
  const order = result.rows[0];

  order.products = result2;

  return order;
}

async function makeOrder(name, address, id) {
  const cart = await getCart(id, false);

  if (cart.error) {
    return null;
  }
  const currentDate = new Date();
  const q = `
    UPDATE carts
    SET isorder = '1',
    name = $1,
    address = $2,
    created = $3
    WHERE isorder = '0'
    AND userid = $4
    RETURNING *
  `;
  const values = [xss(name), xss(address), currentDate, id];

  const result = await query(q, values);
  return cart;
}

module.exports = {
  getCart,
  addToCart,
  changeAmount,
  deleteCartItem,
  getOrders,
  getOrder,
  makeOrder,
  getCartLine
};
