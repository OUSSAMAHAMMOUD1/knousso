require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');

const PRODUCTS = [
  {
    name: 'Derby Cuir Noir',
    description: 'Derby en cuir véritable grain fin, semelle caoutchouc naturel avec surpiqûres contrastées camel. Confort optimal pour un usage quotidien ou les occasions semi-formelles.',
    price: 399,
    category: 'Derby',
    sizes: [40, 41, 42, 43],
    images: ['/images/derby.jpg'],
    featured: true,
    isNewArrival: false,
  },
  {
    name: 'Loafer Cuir Noir',
    description: 'Mocassin penny loafer en cuir lisse, semelle épaisse crantée pour une accroche maximale. Style casual chic, facile à enfiler.',
    price: 399,
    category: 'Mocassin',
    sizes: [40, 41, 42, 43],
    images: ['/images/loafer.jpg'],
    featured: true,
    isNewArrival: false,
  },
  {
    name: 'Brogue Cuir Noir',
    description: 'Brogue classique à perforations décoratives wingtip, cuir haute brillance poli à la main. Semelle cuir avec protection caoutchouc.',
    price: 399,
    category: 'Brogue',
    sizes: [40, 41, 42, 43],
    images: ['/images/brogue.jpg'],
    featured: true,
    isNewArrival: false,
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  const products = await Product.insertMany(PRODUCTS);
  console.log(`✅ ${products.length} produits créés`);

  const adminExists = await User.findOne({ email: 'admin@knousso.ma' });
  if (!adminExists) {
    await User.create({ name: 'Admin KnOusso', email: 'admin@knousso.ma', password: 'admin123456', role: 'admin' });
    console.log('✅ Admin créé: admin@knousso.ma / admin123456');
  }

  console.log('✅ Seed terminé!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
