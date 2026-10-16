import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const PORT = process.env.PORT || 3000;
const PRODUCTS_FILE = new URL('./data/products.json', import.meta.url);
const ORDERS_FILE = new URL('./data/orders.json', import.meta.url);

const SHIPPING_COST = 8990;
const FREE_SHIPPING_FROM = 200000;

const CATEGORIES = [
  { id: 'electricos', name: 'Autos Eléctricos' },
  { id: 'nitro', name: 'Autos Nitro' },
  { id: 'repuestos', name: 'Repuestos' },
  { id: 'lubricantes', name: 'Lubricantes HUDY' }
];

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

const writeJson = (file, data) => writeFile(file, JSON.stringify(data, null, 2));

// Orders read-modify-write the JSON files, so run them one at a time.
let orderQueue = Promise.resolve();
const serialize = fn => (orderQueue = orderQueue.then(fn, fn));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/categories', (req, res) => res.json(CATEGORIES));

app.get('/api/products', async (req, res) => {
  const { category, brand, q, featured, sort } = req.query;
  let products = await readJson(PRODUCTS_FILE, []);

  if (category) products = products.filter(p => p.category === category);
  if (brand) products = products.filter(p => p.brand === brand);
  if (featured === 'true') products = products.filter(p => p.featured);
  if (q) {
    const term = String(q).toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
    );
  }
  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name));

  res.json(products);
});

app.get('/api/products/:slug', async (req, res) => {
  const products = await readJson(PRODUCTS_FILE, []);
  const product = products.find(p => p.slug === req.params.slug);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

// Prices and stock are always taken from the server, never trusted from the client.
app.post('/api/orders', (req, res, next) => {
  serialize(() => createOrder(req, res)).catch(next);
});

async function createOrder(req, res) {
  const { customer, items } = req.body ?? {};

  if (!customer?.name || !customer?.email || !customer?.address || !customer?.phone) {
    return res.status(400).json({ error: 'Faltan datos del cliente' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  const products = await readJson(PRODUCTS_FILE, []);
  const lines = [];

  for (const { productId, quantity } of items) {
    const product = products.find(p => p.id === productId);
    const qty = Number(quantity);
    if (!product) return res.status(400).json({ error: `Producto ${productId} inexistente` });
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ error: `Cantidad inválida para ${product.name}` });
    }
    if (qty > product.stock) {
      return res.status(409).json({ error: `Stock insuficiente de ${product.name} (disponible: ${product.stock})` });
    }
    lines.push({ productId: product.id, name: product.name, unitPrice: product.price, quantity: qty, subtotal: product.price * qty });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;

  for (const line of lines) {
    products.find(p => p.id === line.productId).stock -= line.quantity;
  }

  const order = {
    id: randomUUID().slice(0, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
    customer,
    items: lines,
    subtotal,
    shipping,
    total: subtotal + shipping
  };

  const orders = await readJson(ORDERS_FILE, []);
  orders.push(order);
  await writeJson(ORDERS_FILE, orders);
  await writeJson(PRODUCTS_FILE, products);

  res.status(201).json(order);
}

app.get('/api/orders/:id', async (req, res) => {
  const orders = await readJson(ORDERS_FILE, []);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
  res.json(order);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => console.log(`API RC Shop escuchando en http://localhost:${PORT}`));
