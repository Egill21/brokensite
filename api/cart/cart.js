const {
  addToCart,
  getCart,
  changeAmount,
  deleteCartItem,
<<<<<<< HEAD
  getOrders,
=======
  getCartLine
>>>>>>> ee4e158d0d721855e5d7c4446e1ecd8fa8cb1fb5
} = require('./cartUtils');
const { getProductById } = require('../products/productsUtils');
const { validateCartPost, validateCartPatch } = require('../../validation');

async function cartRoute(req, res) {
  const { id } = req.user;
  const cart = await getCart(id);
  return res.json(cart);
}

async function cartPostRoute(req, res) {
  const { productId, amount } = req.body;
  const { id } = req.user;

  const validationMessage = await validateCartPost(productId, amount);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const items = await addToCart(id, productId, amount);
  const product = await getProductById(productId);
  items.product = product;
  return res.json(items);
}

async function cartLineRoute(req, res) {
  const userid = req.user.id;
  const { id } = req.params;
  const result = await getCartLine(userid, id);

  return res.json(result);
}

async function cartChange(req, res) {
  const userid = req.user.id;
  const { id } = req.params;
  const { amount } = req.body;

  const validationMessage = await validateCartPatch(amount);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }
  const items = await changeAmount(userid, id, amount);
  return res.json(items);
}

async function cartItemDelete(req, res) {
  const userid = req.user.id;
  const { id } = req.params;
  const result = await deleteCartItem(userid, id);

  return res.json(result);
}

async function ordersRoute(req, res) {
  const { id } = req.user;
  const orders = await getOrders(id);
  return res.json(orders);
}

async function ordersPostRoute(req, res) {
  const { productId, amount } = req.body;
  const { id } = req.user;

  const items = await addToCart(id, productId, amount);
  const product = await getProductById(productId);
  items.product = product;
  return res.json(items);
}

module.exports = {
  cartRoute,
  cartPostRoute,
  cartChange,
  cartItemDelete,
  ordersRoute,
  ordersPostRoute,
  cartLineRoute
};
