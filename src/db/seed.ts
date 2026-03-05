import { db } from "./index";
import { users, products, systemSettings, coupons } from "./schema";
import { eq } from "drizzle-orm";

// Simple password hashing using Web Crypto API (SHA-256 with salt)
async function hashPassword(password: string): Promise<string> {
  const salt = "rightclick_salt_2024";
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user: Blessing
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, "Blessing"));

  if (existingAdmin.length === 0) {
    const passwordHash = await hashPassword("Bless@2011");
    await db.insert(users).values({
      username: "Blessing",
      passwordHash,
      role: "admin",
      status: "active",
    });
    console.log("✅ Admin user 'Blessing' created");
  } else {
    console.log("ℹ️  Admin user 'Blessing' already exists");
  }

  // Create admin user: Boss
  const existingBoss = await db
    .select()
    .from(users)
    .where(eq(users.username, "Boss"));

  if (existingBoss.length === 0) {
    const bossPasswordHash = await hashPassword("Boss@Rightclick");
    await db.insert(users).values({
      username: "Boss",
      passwordHash: bossPasswordHash,
      role: "admin",
      status: "active",
    });
    console.log("✅ Admin user 'Boss' created");
  } else {
    console.log("ℹ️  Admin user 'Boss' already exists");
  }

  // Seed system settings
  const defaultSettings = [
    { key: "site_name", value: "RIGHTCLICK COMPUTER DIGITALS" },
    { key: "site_slogan", value: "We give you options." },
    { key: "contact_email", value: "info@rightclickdigitals.com" },
    { key: "contact_phone", value: "+1 (555) 123-4567" },
    { key: "contact_address", value: "123 Tech Street, Digital City" },
    { key: "max_login_attempts", value: "5" },
    { key: "session_timeout_hours", value: "24" },
    { key: "allow_staff_registration", value: "false" },
  ];

  for (const setting of defaultSettings) {
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, setting.key));
    if (existing.length === 0) {
      await db.insert(systemSettings).values(setting);
    }
  }
  console.log("✅ System settings seeded");

  // Seed sample products
  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values([
      {
        name: "ProBook Elite 15",
        category: "laptop",
        description: "High-performance laptop for professionals and power users. Perfect for multitasking, content creation, and business applications.",
        price: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        processor: "Intel Core i7-13th Gen",
        ram: "16GB DDR5",
        storage: "512GB NVMe SSD",
        graphics: "Intel Iris Xe Graphics",
        operatingSystem: "Windows 11 Pro",
        inStock: true,
        featured: true,
        stockQuantity: 15,
        lowStockThreshold: 5,
      },
      {
        name: "GameForce X Pro",
        category: "laptop",
        description: "Ultimate gaming laptop with cutting-edge GPU and high-refresh display. Dominate every game with unmatched performance.",
        price: 1899.99,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600",
        processor: "AMD Ryzen 9 7900X",
        ram: "32GB DDR5",
        storage: "1TB NVMe SSD",
        graphics: "NVIDIA RTX 4070",
        operatingSystem: "Windows 11 Home",
        inStock: true,
        featured: true,
        stockQuantity: 8,
        lowStockThreshold: 3,
      },
      {
        name: "WorkStation Tower Pro",
        category: "desktop",
        description: "Powerful desktop workstation for video editing, 3D rendering, and heavy computational tasks.",
        price: 2499.99,
        imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600",
        processor: "Intel Core i9-13900K",
        ram: "64GB DDR5",
        storage: "2TB NVMe SSD + 4TB HDD",
        graphics: "NVIDIA RTX 4080",
        operatingSystem: "Windows 11 Pro",
        inStock: true,
        featured: true,
        stockQuantity: 5,
        lowStockThreshold: 2,
      },
      {
        name: "BudgetBook 14",
        category: "laptop",
        description: "Affordable and reliable laptop for students and everyday computing tasks.",
        price: 549.99,
        imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600",
        processor: "Intel Core i5-12th Gen",
        ram: "8GB DDR4",
        storage: "256GB SSD",
        graphics: "Intel UHD Graphics",
        operatingSystem: "Windows 11 Home",
        inStock: true,
        featured: false,
      },
      {
        name: "MacBook Air M3",
        category: "laptop",
        description: "Supercharged by M3 chip. Incredibly thin and light laptop with exceptional battery life.",
        price: 1599.99,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
        processor: "Apple M3 Chip",
        ram: "16GB Unified Memory",
        storage: "512GB SSD",
        graphics: "10-core GPU",
        operatingSystem: "macOS Sonoma",
        inStock: true,
        featured: true,
      },
      {
        name: "Dell XPS 15",
        category: "laptop",
        description: "Premium ultrabook with stunning InfinityEdge display and powerful performance.",
        price: 1799.99,
        imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
        processor: "Intel Core i7-13700H",
        ram: "32GB DDR5",
        storage: "1TB NVMe SSD",
        graphics: "NVIDIA RTX 4060",
        operatingSystem: "Windows 11 Home",
        inStock: true,
        featured: true,
      },
      {
        name: "HP Pavilion Desktop",
        category: "desktop",
        description: "Reliable desktop computer for home and office use. Great value for everyday tasks.",
        price: 799.99,
        imageUrl: "https://images.unsplash.com/photo-1624823183492-94f9b8c06e8e?w=600",
        processor: "Intel Core i5-13400",
        ram: "16GB DDR4",
        storage: "512GB SSD",
        graphics: "Intel UHD Graphics 770",
        operatingSystem: "Windows 11 Home",
        inStock: true,
        featured: false,
      },
      {
        name: "Lenovo ThinkPad X1 Carbon",
        category: "laptop",
        description: "Business ultrabook with legendary ThinkPad reliability and lightweight design.",
        price: 1899.99,
        imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600",
        processor: "Intel Core i7-1365U",
        ram: "16GB LPDDR5",
        storage: "512GB NVMe SSD",
        graphics: "Intel Iris Xe Graphics",
        operatingSystem: "Windows 11 Pro",
        inStock: true,
        featured: true,
      },
      {
        name: "Asus ROG Strix G16",
        category: "laptop",
        description: "Gaming powerhouse with aggressive styling and top-tier gaming performance.",
        price: 2199.99,
        imageUrl: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600",
        processor: "Intel Core i9-13980HX",
        ram: "32GB DDR5",
        storage: "1TB NVMe SSD",
        graphics: "NVIDIA RTX 4080",
        operatingSystem: "Windows 11 Home",
        inStock: true,
        featured: true,
      },
      {
        name: "MechKey Pro Keyboard",
        category: "accessory",
        description: "Premium mechanical keyboard with RGB backlighting and tactile switches for the best typing experience.",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "UltraWide 34\" Monitor",
        category: "accessory",
        description: "Stunning 34-inch ultrawide curved monitor with 144Hz refresh rate and HDR support.",
        price: 699.99,
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
        inStock: true,
        featured: true,
      },
      {
        name: "Wireless Mouse Pro",
        category: "accessory",
        description: "Ergonomic wireless mouse with precision tracking and long battery life.",
        price: 49.99,
        imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "USB-C Hub 7-in-1",
        category: "accessory",
        description: "Multi-port USB-C hub with HDMI, USB-A, SD card reader and power delivery.",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "27\" 4K Monitor",
        category: "accessory",
        description: "Professional 27-inch 4K display with color accuracy for creative professionals.",
        price: 549.99,
        imageUrl: "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600",
        inStock: true,
        featured: true,
      },
      {
        name: "Webcam HD 1080p",
        category: "accessory",
        description: "Full HD webcam with autofocus and built-in microphone for video calls.",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Gaming Headset",
        category: "accessory",
        description: "Surround sound gaming headset with noise-canceling microphone.",
        price: 119.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Laptop Backpack",
        category: "accessory",
        description: "Durable laptop backpack with padded compartment and multiple pockets.",
        price: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "External SSD 1TB",
        category: "accessory",
        description: "Fast portable SSD with USB-C for quick file transfers and backups.",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Virus Removal & Tune-Up",
        category: "service",
        description: "Complete virus removal, malware cleanup, and system optimization service. Get your computer running like new.",
        price: 79.99,
        imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Screen Replacement",
        category: "service",
        description: "Professional laptop and desktop screen replacement service. Fast turnaround with quality parts.",
        price: 149.99,
        imageUrl: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Data Recovery",
        category: "service",
        description: "Professional data recovery service from failed hard drives, SSDs, and storage devices.",
        price: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600",
        inStock: true,
        featured: true,
      },
      {
        name: "Software Installation",
        category: "service",
        description: "Professional installation of operating systems, office software, and applications.",
        price: 59.99,
        imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Network Setup",
        category: "service",
        description: "Complete home or office network setup including routers, access points, and security.",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600",
        inStock: true,
        featured: false,
      },
      {
        name: "Laptop Cleaning",
        category: "service",
        description: "Professional internal and external cleaning to improve performance and longevity.",
        price: 39.99,
        imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600",
        inStock: true,
        featured: false,
      },
    ]);
    console.log("✅ Sample products seeded");
  } else {
    console.log("ℹ️  Products already exist, skipping seed");
  }

  // Seed sample coupons
  const existingCoupons = await db.select().from(coupons);
  if (existingCoupons.length === 0) {
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3); // 3 months from now

    await db.insert(coupons).values([
      {
        code: "WELCOME10",
        description: "10% off for new customers",
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 100,
        maxUses: 100,
        maxUsesPerUser: 1,
        validFrom,
        validUntil,
        isActive: true,
      },
      {
        code: "SAVE50",
        description: "₵50 off on orders over ₵500",
        discountType: "fixed",
        discountValue: 50,
        minOrderAmount: 500,
        maxUses: 50,
        maxUsesPerUser: 2,
        validFrom,
        validUntil,
        isActive: true,
      },
      {
        code: "NEWUSER",
        description: "15% off for first-time buyers",
        discountType: "percentage",
        discountValue: 15,
        minOrderAmount: 200,
        maxUses: 200,
        maxUsesPerUser: 1,
        validFrom,
        validUntil,
        isActive: true,
      },
      {
        code: "SUMMER25",
        description: "25% off summer sale",
        discountType: "percentage",
        discountValue: 25,
        minOrderAmount: 300,
        maxUses: 30,
        maxUsesPerUser: 1,
        validFrom,
        validUntil,
        isActive: true,
      },
    ]);
    console.log("✅ Sample coupons seeded");
  } else {
    console.log("ℹ️  Coupons already exist, skipping seed");
  }

  console.log("🎉 Database seeding complete!");
}

seed().catch(console.error);
