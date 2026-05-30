import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { env } from "../config/env";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { logger } from "../utils/logger";

const productsData = [
  {
    title: "AeroSound Max Noise-Cancelling Headphones",
    slug: "aerosound-max-noise-cancelling-headphones",
    price: 14999,
    category: "Electronics",
    description: "Experience industry-leading hybrid active noise cancellation with the AeroSound Max. Features high-fidelity audio, custom equalizer presets, and up to 40 hours of battery life with ultra-fast charging. Designed with plush memory foam earcups for exceptional all-day comfort during travel or intense focus sessions.",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "FitTrack Pro Smart Watch",
    slug: "fittrack-pro-smart-watch",
    price: 8999,
    category: "Electronics",
    description: "Track your health and daily activities with precision. The FitTrack Pro features a dynamic AMOLED display, comprehensive sleep analytics, real-time heart rate monitoring, and continuous SPO2 tracking. Built with 5ATM water resistance and 10+ days of battery life, it is your ultimate fitness partner.",
    stock: 24,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "ApexMechanical Wireless Keyboard",
    slug: "apexmechanical-wireless-keyboard",
    price: 11999,
    category: "Electronics",
    description: "A premium 75% hot-swappable wireless mechanical keyboard designed for enthusiasts and professional typists. Equipped with pre-lubed linear switches, sound-dampening foam, vibrant custom per-key RGB backlighting, and triple-mode connectivity (2.4GHz, Bluetooth 5.1, and USB-C). Fully compatible with macOS and Windows.",
    stock: 8,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "LuminaCast Mini Projector",
    slug: "luminacast-mini-projector",
    price: 24999,
    category: "Electronics",
    description: "Transform any room into a cinematic experience with the LuminaCast Mini Projector. Supporting native 1080p resolution, 800 ANSI lumens, built-in dual stereo speakers, and instant autofocus. Runs on smart TV software so you can stream your favorite apps directly without extra dongles.",
    stock: 5,
    images: ["https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "Classic Leather Jacket",
    slug: "classic-leather-jacket",
    price: 18999,
    category: "Apparel & Accessories",
    description: "Crafted from 100% top-grain genuine lambskin leather, this classic double-rider jacket features heavy-duty asymmetrical metal zippers, quilted satin lining, and functional zippered pockets. A timeless wardrobe staple that only gets richer and softer with age.",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "Vanguard Ergonomic Travel Backpack",
    slug: "vanguard-ergonomic-travel-backpack",
    price: 6499,
    category: "Apparel & Accessories",
    description: "The ultimate travel companion built from water-resistant ballistic nylon. Features a TSA-friendly lay-flat 16-inch laptop sleeve, hidden anti-theft pockets, a built-in USB charging port, and a structured luggage pass-through handle. Contoured shoulder straps and mesh back padding ensure superb ventilation.",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "UrbanStep Canvas Sneakers",
    slug: "urbanstep-canvas-sneakers",
    price: 3499,
    category: "Apparel & Accessories",
    description: "Lightweight, breathable, and designed for daily city strolls. The UrbanStep Canvas Sneakers feature a premium organic cotton upper, a padded OrthoLite insole for superior shock absorption, and a vulcanized non-slip rubber outsole. Easy to wash and match with any casual outfit.",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "AromaMist Essential Oil Diffuser",
    slug: "aromamist-essential-oil-diffuser",
    price: 2999,
    category: "Home & Kitchen",
    description: "Create a peaceful sanctuary in your home. The AromaMist Diffuser uses advanced ultrasonic technology to disperse cold mist containing pure essential oils. Features a large 500ml water tank with up to 10 hours of continuous runtime, whisper-quiet operation, auto shut-off, and 7-color ambient LED rings.",
    stock: 18,
    images: ["https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "BrewMaster Smart Coffee Maker",
    slug: "brewmaster-smart-coffee-maker",
    price: 15999,
    category: "Home & Kitchen",
    description: "Brew the perfect cup of coffee with precision temperature control and customizable brewing strength. Connects to your smartphone via Bluetooth to schedule brewing schedules or customize drip parameters. Crafted in sleek stainless steel and includes a premium thermal carafe to keep coffee hot for hours.",
    stock: 12,
    images: ["https://images.unsplash.com/photo-1518057111178-44a106bad636?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "FlexFlow Eco-Friendly Yoga Mat",
    slug: "flexflow-eco-friendly-yoga-mat",
    price: 2499,
    category: "Fitness & Outdoors",
    description: "Crafted from 100% biodegradable thermoplastic elastomer (TPE), the FlexFlow yoga mat provides dual-sided non-slip textures for exceptional grip on any surface. A plush 6mm cushioning protects your joints during challenging vinyasa flows or restorative poses. Free from PVC and toxic chemicals.",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  },
  {
    title: "HydroGuard Insulated Water Bottle",
    slug: "hydroguard-insulated-water-bottle",
    price: 1999,
    category: "Fitness & Outdoors",
    description: "Keep your drinks ice-cold for 24 hours or piping hot for 12 hours. Constructed with premium food-grade 18/8 stainless steel and double-wall vacuum insulation. Features a leak-proof straw lid and a durable, powder-coated sweat-free exterior that is easy to grip during workouts.",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"],
    isActive: true
  }
];

const seed = async () => {
  try {
    logger.info("Connecting to database for seeding...");
    await mongoose.connect(env.MONGO_URI);
    logger.info("Connected to database. Starting reset...");

    // Clear existing data to maintain integrity
    logger.info("Clearing existing users, products, carts, and orders...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});

    // Create users
    logger.info("Hashing passwords for default accounts...");
    const adminPasswordHash = await bcrypt.hash("Password123!", 12);
    const customerPasswordHash = await bcrypt.hash("Password123!", 12);

    logger.info("Creating admin and customer accounts...");
    await User.create([
      {
        name: "ShopStream Admin",
        email: "admin@shopstream.com",
        passwordHash: adminPasswordHash,
        role: "admin"
      },
      {
        name: "Jane Doe",
        email: "customer@shopstream.com",
        passwordHash: customerPasswordHash,
        role: "customer"
      }
    ]);

    logger.info("Seeding new mock products...");
    await Product.create(productsData);

    logger.info("Database successfully seeded.");
    process.exit(0);
  } catch (error) {
    logger.error("Seeding operation failed", error);
    process.exit(1);
  }
};

seed();
