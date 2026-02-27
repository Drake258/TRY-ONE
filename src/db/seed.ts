import { db } from "./index";
import { users, products, systemSettings } from "./schema";
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
    ]);
    console.log("✅ Sample products seeded");
  } else {
    console.log("ℹ️  Products already exist, skipping seed");
  }

  console.log("🎉 Database seeding complete!");
}

seed().catch(console.error);
