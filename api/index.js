const express = require('express');
const { requireAuth } = require('../auth');

const router = express.Router();

const {
    usersRoute,
    userRoute,
    updateAdminRoute,
    meRoute,
    mePatchRoute,
  } = require('./users');

const {
  productsRoute,
} = require('./products/products');

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function indexRoute(req, res) {
  return res.json({
    users: {
      users: '/users',
      user: '/users/{id}',
      register: '/users/register',
      login: '/users/login',
      me: '/users/me',
    },
    products: {
      products: '/products',
      productsFiltered: '/products?category={category}',
      productsSearch: '/products?search={query}',
      product: '/products/{id}',
      categories: '/categories',
      category: '/categories/{id}',
    },
    cart: {
      cart: '/cart',
      line: '/cart/line/{id}',
      orders: '/orders',
      order: '/orders/{id}',
    },
  });
}

router.get('/', indexRoute);
router.get('/users', requireAuth, catchErrors(usersRoute));
router.patch('/users/:id', requireAuth, catchErrors(updateAdminRoute));
router.get('/users/me', requireAuth, catchErrors(meRoute));
router.get('/users/:id', requireAuth, catchErrors(userRoute));
router.patch('/users/me', requireAuth, catchErrors(mePatchRoute));

router.get('/products', catchErrors(productsRoute));

// router.post('/users/me/profile', requireAuth, catchErrors(meProfileRouteWithMulter));
// router.get('/categories', catchErrors(categoriesRoute));
// router.post('/categories', requireAuth, catchErrors(categoriesPostRoute));
// router.get('/books', catchErrors(booksRoute));
// router.post('/books', requireAuth, catchErrors(booksPostRoute));
// router.get('/books/:id', catchErrors(bookRoute));
// router.patch('/books/:id', requireAuth, catchErrors(bookPatchRoute));
// router.get('/users/me/read', requireAuth, catchErrors(meReadRoute));
// router.get('/users/:id/read', requireAuth, catchErrors(userReadRoute));
// router.post('/users/me/read', requireAuth, catchErrors(meReadPostRoute));
// router.delete('/users/me/read/:id', requireAuth, catchErrors(meReadDeleteRoute));

module.exports = router;
