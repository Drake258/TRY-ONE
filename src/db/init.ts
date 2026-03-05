import { runMigrations } from "@kilocode/app-builder-db";
import { db } from "./index";
import { users, products, systemSettings, services, aiResponses, aiSettings, chatSessions, chatMessages } from "./schema";
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

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;
  initialized = true;

  try {
    // Run migrations
    await runMigrations(db, {}, { migrationsFolder: "./src/db/migrations" });

    // Seed admin user
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
    } else {
      // Ensure Blessing is always an admin
      const admin = existingAdmin[0];
      if (admin.role !== "admin") {
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, admin.id));
        console.log("✅ Updated user 'Blessing' to admin role");
      }
    }

    // Seed admin user: Boss
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
      // Ensure Boss is always an admin
      const boss = existingBoss[0];
      if (boss.role !== "admin") {
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, boss.id));
        console.log("✅ Updated user 'Boss' to admin role");
      }
    }

    // Seed staff user: rightclickcomputerdigitals2010@gmailcom
    const existingStaff = await db
      .select()
      .from(users)
      .where(eq(users.username, "rightclickcomputerdigitals2010@gmailcom"));

    if (existingStaff.length === 0) {
      const staffPasswordHash = await hashPassword("Daniel2026");
      await db.insert(users).values({
        username: "rightclickcomputerdigitals2010@gmailcom",
        passwordHash: staffPasswordHash,
        role: "staff",
        status: "active",
      });
      console.log("✅ Staff user 'rightclickcomputerdigitals2010@gmailcom' created");
    } else {
      // Ensure the user has staff role
      const staff = existingStaff[0];
      if (staff.role !== "staff") {
        await db
          .update(users)
          .set({ role: "staff" })
          .where(eq(users.id, staff.id));
        console.log("✅ Updated user to staff role");
      }
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

    // Seed sample products
    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      await db.insert(products).values([
        {
          name: "ProBook Elite 15",
          category: "laptop",
          description:
            "High-performance laptop for professionals and power users. Perfect for multitasking, content creation, and business applications.",
          price: 1299.99,
          imageUrl:
            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
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
          description:
            "Ultimate gaming laptop with cutting-edge GPU and high-refresh display. Dominate every game with unmatched performance.",
          price: 1899.99,
          imageUrl:
            "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600",
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
          description:
            "Powerful desktop workstation for video editing, 3D rendering, and heavy computational tasks.",
          price: 2499.99,
          imageUrl:
            "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600",
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
          description:
            "Affordable and reliable laptop for students and everyday computing tasks.",
          price: 549.99,
          imageUrl:
            "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600",
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
          description:
            "Premium mechanical keyboard with RGB backlighting and tactile switches for the best typing experience.",
          price: 129.99,
          imageUrl:
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
          inStock: true,
          featured: false,
        },
        {
          name: 'UltraWide 34" Monitor',
          category: "accessory",
          description:
            "Stunning 34-inch ultrawide curved monitor with 144Hz refresh rate and HDR support.",
          price: 699.99,
          imageUrl:
            "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
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
          name: '27" 4K Monitor',
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
          description:
            "Complete virus removal, malware cleanup, and system optimization service. Get your computer running like new.",
          price: 79.99,
          imageUrl:
            "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600",
          inStock: true,
          featured: false,
        },
        {
          name: "Screen Replacement",
          category: "service",
          description:
            "Professional laptop and desktop screen replacement service. Fast turnaround with quality parts.",
          price: 149.99,
          imageUrl:
            "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600",
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
    }

    // Seed sample services
    try {
      const existingServices = await db.select().from(services);
      if (existingServices.length === 0) {
        await db.insert(services).values([
          {
            name: "Computer Repair",
            category: "repair",
            description: "Professional computer repair services for all makes and models. Hardware and software issues.",
            price: 50.00,
            duration: "1-2 hours",
            featured: true,
            active: true,
          },
          {
            name: "Virus & Malware Removal",
            category: "repair",
            description: "Complete system cleanup to remove viruses, malware, spyware, and unwanted programs.",
            price: 79.99,
            duration: "2-4 hours",
            featured: true,
            active: true,
          },
          {
            name: "Screen Replacement",
            category: "repair",
            description: "Fast and professional screen replacement for laptops, tablets, and monitors.",
            price: 149.99,
            duration: "1-2 days",
            featured: false,
            active: true,
          },
          {
            name: "Windows Installation",
            category: "installation",
            description: "Professional Windows OS installation with drivers and essential software setup.",
            price: 59.99,
            duration: "2-3 hours",
            featured: true,
            active: true,
          },
          {
            name: "Software Installation",
            category: "installation",
            description: "Installation and configuration of software applications including Microsoft Office, Adobe, and more.",
            price: 29.99,
            duration: "30 min - 1 hour",
            featured: false,
            active: true,
          },
          {
            name: "Network Setup",
            category: "installation",
            description: "Home or office network setup including routers, access points, and security configuration.",
            price: 99.99,
            duration: "2-4 hours",
            featured: false,
            active: true,
          },
          {
            name: "System Maintenance",
            category: "maintenance",
            description: "Regular system maintenance including cleaning, updates, and performance optimization.",
            price: 49.99,
            duration: "1-2 hours",
            featured: false,
            active: true,
          },
          {
            name: "Data Backup Setup",
            category: "maintenance",
            description: "Set up automated backup solutions to protect your important files and data.",
            price: 69.99,
            duration: "1-2 hours",
            featured: false,
            active: true,
          },
          {
            name: "IT Consultation",
            category: "consultation",
            description: "Expert IT advice and recommendations for your home or business technology needs.",
            price: 39.99,
            duration: "30 minutes",
            featured: false,
            active: true,
          },
          {
            name: "Data Recovery",
            category: "other",
            description: "Recover lost or corrupted data from hard drives, SSDs, USB drives, and memory cards.",
            price: 199.99,
            duration: "1-3 days",
            featured: true,
            active: true,
          },
        ]);
      }
    } catch (serviceError) {
      console.log("Services table not yet available, skipping seed data:", serviceError);
    }

    // Seed AI Assistant responses
    try {
      const existingAiResponses = await db.select().from(aiResponses);
      if (existingAiResponses.length === 0) {
        await db.insert(aiResponses).values([
          // Greetings
          {
            trigger: "hello",
            category: "greeting",
            response: "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. I'm here to help you with any questions about our products, services, orders, or technical support. How can I assist you today?",
            keywords: "hello,hi,hey,good morning,good afternoon,good evening",
            isActive: true,
            priority: 100,
          },
          {
            trigger: "help",
            category: "greeting",
            response: "Hi there! I'm your AI assistant at RIGHTCLICK COMPUTER DIGITALS. I can help you with:\n\n• Product information and recommendations\n• Order status tracking\n• Pricing and payment methods\n• Shipping and delivery\n• Returns and refunds\n• Technical support\n\nWhat would you like to know?",
            keywords: "help,assist,support",
            isActive: true,
            priority: 90,
          },
          // Pricing & Products
          {
            trigger: "laptop prices",
            category: "pricing",
            response: "We offer a wide range of laptops at competitive prices:\n\n• Budget laptops: ₵5,000 - ₵8,000\n• Mid-range laptops: ₵8,000 - ₵15,000\n• High-performance laptops: ₵15,000 - ₵25,000\n• Gaming laptops: ₵18,000 - ₵35,000\n\nWould you like me to show you some specific options based on your needs?",
            keywords: "price,laptop,computer,cost,how much,pricing",
            isActive: true,
            priority: 80,
          },
          {
            trigger: "product availability",
            category: "product",
            response: "Great question! We have a large inventory of computers and accessories. Most items are in stock and ready for immediate delivery or pickup. \n\nTo check specific product availability, please let me know which item you're interested in, and I'll provide current stock status.",
            keywords: "available,in stock,stock,have,available",
            isActive: true,
            priority: 75,
          },
          // Shipping & Delivery
          {
            trigger: "shipping",
            category: "shipping",
            response: "We offer reliable shipping and delivery services:\n\n• **Local Delivery**: Same-day delivery within Accra (orders before 2 PM)\n• **Nationwide**: 2-5 business days for other regions\n• **Pickup**: Visit our store for immediate pickup\n\nDelivery fees vary by location. Contact us for exact shipping costs to your area.",
            keywords: "shipping,delivery,deliver,ship,transport, courier",
            isActive: true,
            priority: 80,
          },
          {
            trigger: "delivery time",
            category: "shipping",
            response: "Our delivery times are:\n\n• **Accra Metro**: Same-day delivery (orders before 2 PM)\n• **Other Ghana cities**: 2-5 business days\n• **International**: 7-14 business days\n\nYou'll receive tracking information once your order is shipped.",
            keywords: "delivery time,how long,when arrive,when will,arrival",
            isActive: true,
            priority: 80,
          },
          // Returns & Refunds
          {
            trigger: "return policy",
            category: "returns",
            response: "Our return policy:\n\n• **7 days**: Return for replacement or refund (unopened items)\n• **14 days**: Return for replacement (defective products)\n• **30 days**: Manufacturer warranty claims\n\nConditions:\n- Product must be in original condition\n- Receipt/invoice required\n- Software (if opened) cannot be returned\n\nWould you like to initiate a return?",
            keywords: "return,refund,exchange,give back,money back",
            isActive: true,
            priority: 85,
          },
          {
            trigger: "refund",
            category: "returns",
            response: "We offer refunds under these conditions:\n\n• **Full refund**: Within 7 days for unopened items\n• **Partial refund**: For used items (case-by-case)\n\nRefund timeline:\n- Processing: 5-7 business days\n- Credit card: 7-14 business days\n- Mobile Money: 3-5 business days\n\nPlease provide your order number for refund inquiries.",
            keywords: "refund,money back,reimburse",
            isActive: true,
            priority: 80,
          },
          // Payment Methods
          {
            trigger: "payment methods",
            category: "payment",
            response: "We accept the following payment methods:\n\n• **Mobile Money (MoMo)**: Instant payment via MTN, Vodafone, AirtelTigo\n• **Bank Transfer**: Direct bank transfer to our account\n• **Card Payment**: Visa, Mastercard, GhIPSS\n• **Cash**: Pay at our physical store\n• **Layaway**: Pay in installments\n\nWhich payment method would you prefer?",
            keywords: "payment,pay,momo,mobile money,bank transfer,card,cash,installment",
            isActive: true,
            priority: 90,
          },
          {
            trigger: "momo payment",
            category: "payment",
            response: "Mobile Money (MoMo) Payment:\n\nTo pay via MoMo:\n1. Send amount to **0503819000**\n2. Include your order number as reference\n3. You'll receive confirmation SMS\n\nOur MoMo numbers:\n- MTN: 0503819000\n- Vodafone: 0503819000\n\nQuestions? We're here to help!",
            keywords: "momo,mobile money,mtn,vodafone,airteltigo,send money",
            isActive: true,
            priority: 85,
          },
          // Order Status
          {
            trigger: "order status",
            category: "order",
            response: "To check your order status, please provide your order number. I'll look it up and give you the latest update on your order.\n\nYour order number should be in the format: **RC-XXXXX**",
            keywords: "order,status,track,tracking,where is my order",
            isActive: true,
            priority: 95,
          },
          {
            trigger: "order number",
            category: "order",
            response: "Your order number starts with **RC-** and can be found:\n\n• In your confirmation email\n• In your SMS receipt\n• On your purchase invoice\n\nPlease share your order number (or the phone number you used for ordering) so I can check your order status.",
            keywords: "order number,order id,order number",
            isActive: true,
            priority: 85,
          },
          // Technical Support
          {
            trigger: "computer slow",
            category: "support",
            response: "I'm sorry to hear your computer is running slowly. Here are some quick fixes:\n\n1. **Restart your computer** - clears temporary files\n2. **Check storage** - ensure at least 10% free space\n3. **Update software** - Windows updates, drivers\n4. **Run antivirus scan** - remove malware\n5. **Disable startup programs** - reduces boot time\n\nIf the problem persists, we offer **Virus Removal & Tune-Up** service at ₵800. Would you like to book an appointment?",
            keywords: "slow,laggy,not working,freeze,crash,problem",
            isActive: true,
            priority: 70,
          },
          {
            trigger: "virus",
            category: "support",
            response: "If you suspect a virus, here's what to do:\n\n1. **Don't panic** - don't click suspicious links\n2. **Disconnect from internet** (if safe)\n3. **Run a scan** with Windows Defender or your antivirus\n\nOur **Virus & Malware Removal** service (₵800) can help fully clean your system. We also offer:-\n• Free basic system check\n• Data backup before cleaning\n• Security installation\n\nWould you like to schedule a service?",
            keywords: "virus,malware,spyware,hacked,infected,security",
            isActive: true,
            priority: 80,
          },
          {
            trigger: "repair",
            category: "support",
            response: "We offer professional repair services:\n\n• **Screen Replacement**: ₵1,500 - ₵3,000\n• **Keyboard Repair**: ₵300 - ₵800\n• **Battery Replacement**: ₵500 - ₵1,500\n• **Hardware Upgrade**: Quote on request\n• **Data Recovery**: ₵2,000 - ₵5,000\n\nBring your device to our store or schedule a pickup. Our technicians will diagnose and provide a quote first!\n\nWould you like to book a repair appointment?",
            keywords: "repair,fix,broken,damage,replacement,service",
            isActive: true,
            priority: 75,
          },
          // Contact Information
          {
            trigger: "contact",
            category: "general",
            response: "You can reach us through:\n\n• **Phone**: 0503819000\n• **WhatsApp**: 0503819000\n• **Email**: info@rightclickdigitals.com\n• **Address**: Accra, Ghana\n\n**Store Hours**:\n• Monday - Friday: 8 AM - 6 PM\n• Saturday: 9 AM - 4 PM\n• Sunday: Closed\n\nWe're here to help!",
            keywords: "contact,phone,call,email,reach,address,location",
            isActive: true,
            priority: 90,
          },
          {
            trigger: "whatsapp",
            category: "general",
            response: "You can reach us on WhatsApp at **0503819000**!\n\nWe're available for quick chats and can share product images, invoices, and more. Looking forward to hearing from you!",
            keywords: "whatsapp,wa,message,chat",
            isActive: true,
            priority: 85,
          },
          // FAQ
          {
            trigger: "warranty",
            category: "faq",
            response: "Our warranty terms:\n\n• **Laptops**: 1-year manufacturer warranty\n• **Desktops**: 1-year manufacturer warranty\n• **Accessories**: 6-month warranty\n• **Services**: 30-day service guarantee\n\nWarranty covers:\n- Manufacturing defects\n- Hardware failures (not physical damage)\n\nExtended warranty available for purchase. Would you like more details?",
            keywords: "warranty,guarantee,coverage",
            isActive: true,
            priority: 75,
          },
          {
            trigger: "opening hours",
            category: "general",
            response: "Our store hours:\n\n• **Monday - Friday**: 8:00 AM - 6:00 PM\n• **Saturday**: 9:00 AM - 4:00 PM\n• **Sunday**: Closed\n\nWe also offer online support 24/7! Feel free to browse our products anytime.",
            keywords: "hours,open,time,when,schedule",
            isActive: true,
            priority: 80,
          },
          // Complaints
          {
            trigger: "complaint",
            category: "support",
            response: "I'm really sorry to hear about your experience. Your satisfaction is important to us.\n\nPlease share more details about your concern, and I'll escalate it to our management team immediately.\n\nYou can also reach us directly at **0503819000** for urgent matters. We're committed to resolving your issue.",
            keywords: "complaint,unhappy,disappointed,problem,issue",
            isActive: true,
            priority: 100,
          },
          // Product Recommendations
          {
            trigger: "gaming laptop",
            category: "product",
            response: "Here are our top gaming laptops:\n\n1. **GameForce X Pro** - ₵19,000\n   - AMD Ryzen 9, 32GB RAM, RTX 4070\n\n2. **Asus ROG Strix G16** - ₵22,000\n   - Intel i9, 32GB RAM, RTX 4080\n\n3. **Omen 17** - ₵18,500\n   - Intel i7, 16GB RAM, RTX 4060\n\nAll gaming laptops come with 1-year warranty. Would you like more details or to place an order?",
            keywords: "gaming,gamer,game,play",
            isActive: true,
            priority: 70,
          },
          {
            trigger: "student laptop",
            category: "product",
            response: "Best laptops for students:\n\n1. **BudgetBook 14** - ₵5,500\n   - Intel i5, 8GB RAM, 256GB SSD\n   - Perfect for assignments and research\n\n2. **MacBook Air M3** - ₵16,000\n   - Apple M3, 16GB RAM, 512GB SSD\n   - Lightweight, long battery life\n\n3. **Lenovo ThinkPad X1** - ₵19,000\n   - Business-grade, durable\n\nWhat's your budget? I'll recommend the best option!",
            keywords: "student,school,university,education,learning",
            isActive: true,
            priority: 70,
          },
          // Escalation
          {
            trigger: "speak to human",
            category: "support",
            response: "I understand you'd like to speak with a human agent. Let me connect you with our support team.\n\nPlease provide:\n• Your name\n• Your order number (if applicable)\n• Brief description of your issue\n\nI'll escalate this to our team who will contact you within business hours. You can also call us directly at **0503819000**.",
            keywords: "human,agent,manager,supervisor,real person,escalate",
            isActive: true,
            priority: 100,
          },
          // Default response
          {
            trigger: "default",
            category: "general",
            response: "Thank you for contacting RIGHTCLICK COMPUTER DIGITALS!\n\nI'm here to help with:\n• Product information and recommendations\n• Order tracking and status\n• Payment and pricing inquiries\n• Technical support and repairs\n• Shipping and delivery info\n\nCould you please provide more details about your question? That way I can give you the best assistance possible!\n\nOr call us at **0503819000** for immediate support.",
            keywords: "default",
            isActive: true,
            priority: 0,
          },
        ]);
        console.log("✅ AI Assistant responses seeded");
      }

      // Seed AI Settings
      const existingAiSettings = await db.select().from(aiSettings);
      if (existingAiSettings.length === 0) {
        await db.insert(aiSettings).values([
          { key: "ai_enabled", value: "true" },
          { key: "welcome_message", value: "Hello! Welcome to RIGHTCLICK COMPUTER DIGITALS. How can I help you today?" },
          { key: "company_phone", value: "0503819000" },
          { key: "company_email", value: "info@rightclickdigitals.com" },
          { key: "company_address", value: "Accra, Ghana" },
          { key: "business_hours", value: "Monday - Friday: 8 AM - 6 PM, Saturday: 9 AM - 4 PM" },
        ]);
        console.log("✅ AI Assistant settings seeded");
      }
    } catch (aiError) {
      console.log("AI tables not yet available, skipping seed data:", aiError);
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    // Reset so it can be retried
    initialized = false;
    throw error;
  }
}
