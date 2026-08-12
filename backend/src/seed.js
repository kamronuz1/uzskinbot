const mongoose = require('mongoose');
require('dotenv').config();
const Skin = require('./models/Skin');
const Case = require('./models/Case');

const skins = [
  { name: "Solar Fang",    type: "Pichoq",    rarity: "myth",   price: 184.2 },
  { name: "Void Reaper",   type: "Miltiq",    rarity: "legend", price: 96.4 },
  { name: "Crimson Howl",  type: "Miltiq",    rarity: "epic",   price: 41.8 },
  { name: "Glacier Fang",  type: "Pichoq",    rarity: "epic",   price: 37.1 },
  { name: "Nebula Strike", type: "Tapancha",  rarity: "rare",   price: 14.6 },
  { name: "Ember Coil",    type: "Miltiq",    rarity: "rare",   price: 11.2 },
  { name: "Iron Vex",      type: "Tapancha",  rarity: "common", price: 3.4 },
  { name: "Ash Serpent",   type: "Miltiq",    rarity: "common", price: 2.1 },
  { name: "Storm Wing",    type: "Pichoq",    rarity: "rare",   price: 18.9 },
  { name: "Obsidian Roar", type: "Miltiq",    rarity: "epic",   price: 52.3 },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await Skin.deleteMany({});
  await Case.deleteMany({});

  const createdSkins = await Skin.insertMany(skins);
  console.log(`${createdSkins.length} ta skin qo'shildi`);

  await Case.insertMany([
    { name: "Street Case", price: 2.5, color: "#4EA1FF", odds: { common:60, rare:28, epic:10, legend:1.7, myth:0.3 } },
    { name: "Neon Case",   price: 6.0, color: "#B24BFF", odds: { common:45, rare:32, epic:17, legend:5, myth:1 } },
    { name: "Vortex Case", price: 14.0, color: "#FFB020", odds: { common:30, rare:30, epic:25, legend:12, myth:3 } },
  ]);
  console.log("3 ta case qo'shildi");

  await mongoose.disconnect();
  console.log("Tayyor!");
}

run();