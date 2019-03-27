const {
  addToCart,
  getCart,
  changeAmount,
  deleteCartItem,
  getOrders,
  getOrder,
  makeOrder,
  getCartLine
} = require('./cartUtils');
const { getProductById } = require('../products/productsUtils');
const {
  validateCartPost,
  validateCartPatch,
  validateId,
  validateOrderPost
} = require('../../validation');

async function cartRoute(req, res) {
  const { id } = req.user;
  const cart = await getCart(id, false);
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

  const validationMessage = await validateId(id);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }
  const result = await getCartLine(userid, id);
  console.log(result);
  if (result.error) {
    return res.status(404).json({ errors: result.error });
  }
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
  if (items.error) {
    return res.status(404).json(items);
  }
  return res.status(200).json(items);
}

async function cartItemDelete(req, res) {
  const userid = req.user.id;
  const { id } = req.params;
  const validationMessage = await validateId(id);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }
  const result = await deleteCartItem(userid, id);

  if (result.error) {
    return res.status(404).json(result);
  }
  return res.status(200).json(result);
}

async function ordersRoute(req, res) {
  const { id, admin } = req.user;
  const { offset = 0 } = req.query;

  const orders = await getOrders(id, admin, offset);
  return res.json(orders);
}

async function ordersPostRoute(req, res) {
  const { id } = req.user;
  const { name, address } = req.body;

  const validationMessage = validateOrderPost(name, address);
  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const result = await makeOrder(name, address, id);

  if (!result) {
    const message = 'You dont have anything in your cart';
    return res.status(404).json({ error: message });
  }
  return res.json(result);
}

async function orderRoute(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Id entry not found' });
  }

  const order = await getOrder(id);
  const { user } = req;

  if (!user.admin && user.id !== order.userid) {
    res
      .status(401)
      .json({ error: 'You are not authorized to access this order' });
  }
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
  }

  return res.json(order);
}

module.exports = {
  cartRoute,
  cartPostRoute,
  cartChange,
  cartItemDelete,
  ordersRoute,
  ordersPostRoute,
  orderRoute,
  cartLineRoute
};
