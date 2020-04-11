const {
  getProducts,
  getProductById,
  makeNewProduct,
  updateProduct,
  getCategories,
  getCategory,
  getCategoryById,
  newCategory,
  categoryInProducts,
  updateCategory
} = require('./productsUtils');

const { validateProduct, validateCategory } = require('../../validation');

const { uploadImage } = require('../../cloud');
const { query } = require('../../db');

async function productsRoute(req, res) {
  const { offset = 0 } = req.query;
  const { category, search } = req.query;

  const products = await getProducts(offset, category, search);
  return res.json(products);
}

async function newProductRoute(req, res) {
  const {
    title = '',
    price = '',
    descr = '',
    img = '',
    category = ''
  } = req.body;

  // const validationMessage = await validateProduct({
  //   title,
  //   price,
  //   descr,
  //   category
  // });

  // if (validationMessage.length > 0) {
  //   return res.status(400).json({ errors: validationMessage });
  // }
  let image = '';
  if (img !== '') {
    const imgURL = await uploadImage(img);
    if (typeof imgURL !== 'string') {
      return res.status(400).json({
        errors: {
          field: 'img',
          message: 'Villa við að hlaða mynd'
        }
      });
    }
    image = imgURL;
  }

  const result = await makeNewProduct({ title, price, descr, image, category });

  return res.status(201).json(result);
}

async function productRoute(req, res) {
  const { id } = req.params;

  const product = await getProductById(id);

  if (product === null) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json(product);
}

async function productPatchRoute(req, res) {
  const { id } = req.params;

  const product = await getProductById(id);

  if (product === null) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { title, price, descr, img, category } = req.body;

  const validationMessage = await validateProduct(
    { title, price, descr, category },
    true
  );

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  let image = undefined;
  if (img !== undefined) {
    const imgURL = await uploadImage(img);
    if (typeof imgURL !== 'string') {
      return res.status(400).json({
        errors: {
          field: 'img',
          message: 'Villa við að hlaða mynd'
        }
      });
    }
    image = imgURL;
  }

  const result = await updateProduct(id, title, price, descr, image, category);

  if (!result) {
    return res.status(400).json({ error: 'Nothing to patch' });
  }

  return res.status(200).json(result);
}

async function productDeleteRoute(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Id entry not found' });
  }

  const product = await getProductById(id);

  if (product === null) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const del = await query('DELETE FROM products WHERE id = $1', [id]);

  if (del.rowCount === 1) {
    return res.status(204).json({});
  }

  return res.status(404).json({ error: 'Id entry not found' });
}

async function categoriesRoute(req, res) {
  const categories = await getCategories();
  return res.json(categories);
}

async function categoriesPostRoute(req, res) {
  const { title } = req.body;

  const category = await getCategory(title);

  if (category.length !== 0) {
    return res.status(404).json({ error: 'Category already exists' });
  }

  const validationMessage = validateCategory(title);

  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const result = await newCategory(title);

  return res.status(201).json(result);
}

async function categoryPatchRoute(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Id entry not found' });
  }

  const category = await getCategoryById(id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const { title } = req.body;

  const validationMessage = validateCategory(title);
  if (validationMessage.length > 0) {
    return res.status(400).json({ errors: validationMessage });
  }

  const category2 = await getCategory(title);
  if (category2.length !== 0) {
    return res.status(404).json({ error: 'Category already exists' });
  }

  const category3 = await categoryInProducts(title);
  if (category3.length > 0) {
    return res.status(404).json({ error: 'Category is still in use' });
  }

  const result = await updateCategory(id, title);
  if (!result) {
    return res.status(400).json({ error: 'Nothing to patch' });
  }
  return res.status(200).json(result);
}

async function categoryDeleteRoute(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    return res.status(404).json({ error: 'Id entry not found' });
  }

  const category = await getCategoryById(id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const category2 = await categoryInProducts(category[0].title);
  if (category2.length > 0) {
    return res.status(404).json({ error: 'Category is still in use' });
  }

  const del = await query('DELETE FROM categories WHERE id = $1', [id]);
  if (del.rowCount === 1) {
    return res.status(204).json({});
  }

  return res.status(404).json({ error: 'Id entry not found' });
}

module.exports = {
  productsRoute,
  productRoute,
  productPatchRoute,
  productDeleteRoute,
  newProductRoute,
  categoriesRoute,
  categoriesPostRoute,
  categoryPatchRoute,
  categoryDeleteRoute
};
