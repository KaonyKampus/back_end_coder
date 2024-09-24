const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Helper function to read products from the file
const readProducts = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

// Helper function to write products to the file
const writeProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// GET / - Listar todos los productos
router.get('/', (req, res) => {
  const products = readProducts();
  const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
  res.json(products.slice(0, limit));
});

// GET /:pid - Traer producto por ID
router.get('/:pid', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id == req.params.pid);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(product);
});

// POST / - Agregar un nuevo producto
router.post('/', (req, res) => {
  const products = readProducts();
  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1, // Generación automática de ID
    title: req.body.title,
    description: req.body.description,
    code: req.body.code,
    price: req.body.price,
    status: req.body.status || true,
    stock: req.body.stock,
    category: req.body.category,
    thumbnails: req.body.thumbnails || []
  };

  if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios, excepto thumbnails' });
  }

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// PUT /:pid - Actualizar un producto
router.put('/:pid', (req, res) => {
  const products = readProducts();
  const productIndex = products.findIndex(p => p.id == req.params.pid);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  const updatedProduct = {
    ...products[productIndex],
    ...req.body
  };

  products[productIndex] = updatedProduct;
  writeProducts(products);

  res.json(updatedProduct);
});

// DELETE /:pid - Eliminar un producto
router.delete('/:pid', (req, res) => {
  let products = readProducts();
  const productIndex = products.findIndex(p => p.id == req.params.pid);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  products = products.filter(p => p.id != req.params.pid);
  writeProducts(products);

  res.json({ message: 'Producto eliminado' });
});

module.exports = router;
