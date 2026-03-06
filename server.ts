import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("handson.db");

// Initialize Database
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'worker', 'admin')) NOT NULL,
      is_suspended BOOLEAN DEFAULT 0,
      profile_photo TEXT,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      category TEXT NOT NULL,
      experience_years INTEGER,
      bio TEXT,
      profile_photo TEXT,
      hourly_rate REAL,
      latitude REAL,
      longitude REAL,
      is_verified BOOLEAN DEFAULT 0,
      is_available BOOLEAN DEFAULT 1,
      portfolio TEXT,
      documents TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,
      description TEXT,
      preferred_datetime TEXT,
      urgency TEXT CHECK(urgency IN ('low', 'medium', 'high', 'emergency')) DEFAULT 'medium',
      photos TEXT,
      status TEXT CHECK(status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
      latitude REAL,
      longitude REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      transaction_id TEXT UNIQUE,
      status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES job_requests(id)
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      worker_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES job_requests(id),
      FOREIGN KEY (customer_id) REFERENCES users(id),
      FOREIGN KEY (worker_id) REFERENCES workers(id)
    );
  `);
} catch (err) {
  console.error("Database initialization error:", err);
}

// Migration: Add missing columns if they don't exist
const migrate = () => {
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as any[];
  const workerColumns = db.prepare("PRAGMA table_info(workers)").all() as any[];

  const addUserColumn = (colName: string, type: string) => {
    if (!userColumns.find(c => c.name === colName)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${colName} ${type}`);
    }
  };

  const addWorkerColumn = (colName: string, type: string) => {
    if (!workerColumns.find(c => c.name === colName)) {
      db.exec(`ALTER TABLE workers ADD COLUMN ${colName} ${type}`);
    }
  };

  addUserColumn('is_suspended', 'BOOLEAN DEFAULT 0');
  addUserColumn('profile_photo', 'TEXT');
  addUserColumn('last_seen', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  
  addWorkerColumn('profile_photo', 'TEXT');
  addWorkerColumn('is_verified', 'BOOLEAN DEFAULT 0');
  addWorkerColumn('is_available', 'BOOLEAN DEFAULT 1');
  addWorkerColumn('portfolio', 'TEXT');
  addWorkerColumn('documents', 'TEXT');

  const jobColumns = db.prepare("PRAGMA table_info(job_requests)").all() as any[];
  if (!jobColumns.find(c => c.name === 'photos')) {
    db.exec("ALTER TABLE job_requests ADD COLUMN photos TEXT");
  }
  if (!jobColumns.find(c => c.name === 'status')) {
    db.exec("ALTER TABLE job_requests ADD COLUMN status TEXT DEFAULT 'pending'");
  }

  const paymentColumns = db.prepare("PRAGMA table_info(payments)").all() as any[];
  if (!paymentColumns.find(c => c.name === 'transaction_id')) {
    db.exec("ALTER TABLE payments ADD COLUMN transaction_id TEXT UNIQUE");
  }
  if (!paymentColumns.find(c => c.name === 'status')) {
    db.exec("ALTER TABLE payments ADD COLUMN status TEXT DEFAULT 'pending'");
  }
};

migrate();

// Seeding Logic
const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    console.log("Seeding database with Kenyan examples...");
    
    const sampleWorkers = [
      { name: "James Kamau", email: "kamau@example.com", phone: "0712345678", category: "Plumbing", bio: "Expert plumber with 10 years experience in Roysambu. Specializes in leak detection and bathroom fittings.", rate: 1200, verified: 1, portfolio: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a', 'https://images.unsplash.com/photo-1504148455328-c376907d081c'], photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&h=400&fit=crop' },
      { name: "Mary Atieno", email: "mary@example.com", phone: "0722345678", category: "Cleaning", bio: "Professional deep cleaning services for homes and offices. Very thorough and reliable.", rate: 800, verified: 1, portfolio: ['https://images.unsplash.com/photo-1581578731548-c64695cc6958', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac'], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
      { name: "David Omondi", email: "david@example.com", phone: "0733345678", category: "Electrical", bio: "Certified electrician. I handle house wiring, socket repairs, and solar installations.", rate: 1500, verified: 0, portfolio: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 'https://images.unsplash.com/photo-1558211583-d28f610b15a0'], photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
      { name: "Sarah Njeri", email: "sarah@example.com", phone: "0744345678", category: "Painting", bio: "Creative painter and interior decorator. I bring life to your walls with quality finishes.", rate: 1000, verified: 1, portfolio: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f', 'https://images.unsplash.com/photo-1562664377-709f2c337eb2'], photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop' },
      { name: "Peter Kipkorir", email: "peter@example.com", phone: "0755345678", category: "Carpentry", bio: "Custom furniture maker and repair expert. Quality woodwork guaranteed.", rate: 1300, verified: 0, portfolio: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85'], photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
      { name: "Faith Wambui", email: "faith@example.com", phone: "0766345678", category: "Technician", bio: "Appliance repair specialist. I fix fridges, microwaves, and washing machines.", rate: 1100, verified: 1, portfolio: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837'], photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' }
    ];

    for (const w of sampleWorkers) {
      const userResult = db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, 'password123', 'worker')").run(w.name, w.email, w.phone);
      const userId = userResult.lastInsertRowid;
      db.prepare("INSERT INTO workers (user_id, category, experience_years, bio, hourly_rate, is_verified, portfolio, profile_photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(userId, w.category, 5, w.bio, w.rate, w.verified, JSON.stringify(w.portfolio), w.photo);
    }

    // Add a sample customer
    db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, 'password123', 'customer')").run("Sylvester Omondi", "omondi@example.com", "0700123456");
    
    // Seed initial categories
    const initialCategories = [
      { name: "Plumbing", icon: "Droplets" },
      { name: "Electrical", icon: "Zap" },
      { name: "Cleaning", icon: "Sparkles" },
      { name: "Painting", icon: "Palette" },
      { name: "Carpentry", icon: "Hammer" },
      { name: "Technician", icon: "Cpu" }
    ];
    for (const cat of initialCategories) {
      db.prepare("INSERT INTO categories (name, icon) VALUES (?, ?)").run(cat.name, cat.icon);
    }

    console.log("Seeding complete.");
  }

  // Ensure the specific admin user always exists and is up to date
  const adminEmail = "omondisylvester999@gmail.com";
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
  
  if (!existingAdmin) {
    db.prepare("INSERT INTO users (name, email, phone, password, role, profile_photo) VALUES (?, ?, ?, 'admin123', 'admin', ?)")
      .run("Sylvester Ouma", adminEmail, "0785972666", "https://ais-dev-eehrswnxhzbtevcrqu56o4-57740983061.europe-west2.run.app/api/images/64");
    console.log("Admin user created: omondisylvester999@gmail.com / admin123");
  } else {
    db.prepare("UPDATE users SET name = ?, phone = ?, role = 'admin', profile_photo = ? WHERE email = ?")
      .run("Sylvester Ouma", "0785972666", "https://ais-dev-eehrswnxhzbtevcrqu56o4-57740983061.europe-west2.run.app/api/images/64", adminEmail);
    console.log("Admin user updated: Sylvester Ouma");
  }
};

seedData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/register", (req, res) => {
    const { name, email, phone, password, role } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)").run(name, email, phone, password, role);
      const userId = result.lastInsertRowid;
      
      if (role === 'worker') {
        const { category, experience_years, bio, hourly_rate } = req.body;
        db.prepare("INSERT INTO workers (user_id, category, experience_years, bio, hourly_rate) VALUES (?, ?, ?, ?, ?)").run(userId, category, experience_years, bio, hourly_rate);
      }
      
      res.json({ success: true, userId });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      if (user.is_suspended) {
        return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
      }
      // Update last_seen
      db.prepare("UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
      
      let workerProfile = null;
      if (user.role === 'worker') {
        workerProfile = db.prepare("SELECT * FROM workers WHERE user_id = ?").get(user.id);
      }
      res.json({ success: true, user: { ...user, workerProfile } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/workers", (req, res) => {
    const { category, lat, lng } = req.query;
    let query = `
      SELECT u.name, u.phone, u.last_seen, w.*, 
      (SELECT AVG(rating) FROM reviews WHERE worker_id = w.id) as avg_rating,
      CASE WHEN u.last_seen > datetime('now', '-5 minutes') THEN 1 ELSE 0 END as is_online
      FROM workers w
      JOIN users u ON w.user_id = u.id
      WHERE w.is_verified = 1 AND w.is_available = 1
    `;
    const params: any[] = [];
    if (category) {
      query += " AND w.category = ?";
      params.push(category);
    }
    const workers = db.prepare(query).all(...params);
    res.json(workers);
  });

  app.post("/api/jobs", (req, res) => {
    const { customer_id, worker_id, service_type, description, latitude, longitude, preferred_datetime, urgency, photos } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO job_requests 
        (customer_id, worker_id, service_type, description, latitude, longitude, preferred_datetime, urgency, photos) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(customer_id, worker_id, service_type, description, latitude, longitude, preferred_datetime, urgency, photos);
      res.json({ success: true, jobId: result.lastInsertRowid });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/jobs/customer/:id", (req, res) => {
    const jobs = db.prepare(`
      SELECT j.*, u.name as worker_name, w.category, w.profile_photo,
      CASE WHEN u.last_seen > datetime('now', '-5 minutes') THEN 1 ELSE 0 END as is_online,
      CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END as is_reviewed
      FROM job_requests j
      JOIN workers w ON j.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      LEFT JOIN reviews r ON j.id = r.job_id
      WHERE j.customer_id = ?
      ORDER BY j.created_at DESC
    `).all(req.params.id);
    res.json(jobs);
  });

  app.get("/api/jobs/worker/:id", (req, res) => {
    // Update last_seen
    db.prepare("UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = (SELECT user_id FROM workers WHERE id = ?)").run(req.params.id);
    
    const jobs = db.prepare(`
      SELECT j.*, u.name as customer_name, u.phone as customer_phone,
      CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END as is_reviewed
      FROM job_requests j
      JOIN users u ON j.customer_id = u.id
      LEFT JOIN reviews r ON j.id = r.job_id
      WHERE j.worker_id = ?
      ORDER BY j.created_at DESC
    `).all(req.params.id);
    res.json(jobs);
  });

  app.patch("/api/jobs/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE job_requests SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // M-Pesa Mock API
  app.post("/api/payments/stk-push", (req, res) => {
    const { jobId, amount, phone } = req.body;
    // In a real app, this would call Daraja API
    console.log(`Simulating M-Pesa STK Push for Job ${jobId}, Amount ${amount}, Phone ${phone}`);
    
    // Mock success
    const transactionId = "MPESA" + Math.random().toString(36).substring(7).toUpperCase();
    db.prepare("INSERT INTO payments (job_id, amount, transaction_id, status) VALUES (?, ?, ?, 'completed')").run(jobId, amount, transactionId);
    db.prepare("UPDATE job_requests SET status = 'completed' WHERE id = ?").run(jobId);
    
    res.json({ success: true, transactionId });
  });

  // Admin Routes
  app.post("/api/workers/:id/portfolio", (req, res) => {
    const { id } = req.params;
    const { portfolio } = req.body;
    try {
      db.prepare("UPDATE workers SET portfolio = ? WHERE id = ?").run(JSON.stringify(portfolio), id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/workers/:id/availability", (req, res) => {
    const { is_available } = req.body;
    db.prepare("UPDATE workers SET is_available = ? WHERE id = ?").run(is_available ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/workers/:id/verify", (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
      db.prepare("UPDATE workers SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/stats", (req, res) => {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const totalWorkers = db.prepare("SELECT COUNT(*) as count FROM workers").get() as any;
    const totalJobs = db.prepare("SELECT COUNT(*) as count FROM job_requests").get() as any;
    const totalPayments = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'").get() as any;
    
    res.json({
      users: totalUsers.count,
      workers: totalWorkers.count,
      jobs: totalJobs.count,
      revenue: totalPayments.total || 0
    });
  });

  app.get("/api/admin/users", (req, res) => {
    const users = db.prepare(`
      SELECT u.*, w.id as worker_id, w.is_verified, w.category, w.documents
      FROM users u
      LEFT JOIN workers w ON u.id = w.user_id
      ORDER BY u.created_at DESC
    `).all();
    res.json(users);
  });

  app.get("/api/admin/jobs", (req, res) => {
    const jobs = db.prepare(`
      SELECT j.*, c.name as customer_name, w_u.name as worker_name
      FROM job_requests j
      JOIN users c ON j.customer_id = c.id
      JOIN workers w ON j.worker_id = w.id
      JOIN users w_u ON w.user_id = w_u.id
      ORDER BY j.created_at DESC
    `).all();
    res.json(jobs);
  });

  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
    res.json(categories);
  });

  app.post("/api/admin/categories", (req, res) => {
    const { name, icon } = req.body;
    try {
      db.prepare("INSERT INTO categories (name, icon) VALUES (?, ?)").run(name, icon);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/categories/:id", (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/analytics", (req, res) => {
    const jobsByDay = db.prepare(`
      SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(*) as count 
      FROM job_requests 
      GROUP BY date 
      ORDER BY date DESC 
      LIMIT 7
    `).all();
    
    const revenueByDay = db.prepare(`
      SELECT strftime('%Y-%m-%d', created_at) as date, SUM(amount) as amount 
      FROM payments 
      WHERE status = 'completed'
      GROUP BY date 
      ORDER BY date DESC 
      LIMIT 7
    `).all();

    res.json({ jobsByDay, revenueByDay });
  });

  app.get("/api/admin/transactions", (req, res) => {
    const transactions = db.prepare(`
      SELECT p.*, j.service_type, c.name as customer_name, w_u.name as worker_name
      FROM payments p
      JOIN job_requests j ON p.job_id = j.id
      JOIN users c ON j.customer_id = c.id
      JOIN workers w ON j.worker_id = w.id
      JOIN users w_u ON w.user_id = w_u.id
      ORDER BY p.created_at DESC
    `).all();
    res.json(transactions);
  });

  app.post("/api/admin/users/:id/suspend", (req, res) => {
    const { id } = req.params;
    const { is_suspended } = req.body;
    try {
      db.prepare("UPDATE users SET is_suspended = ? WHERE id = ?").run(is_suspended ? 1 : 0, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/workers/:id/documents", (req, res) => {
    const { id } = req.params;
    const { documents } = req.body;
    try {
      db.prepare("UPDATE workers SET documents = ? WHERE id = ?").run(JSON.stringify(documents), id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/workers/:id/verify", (req, res) => {
    const { id } = req.params;
    const { is_verified } = req.body;
    try {
      db.prepare("UPDATE workers SET is_verified = ? WHERE id = ?").run(is_verified ? 1 : 0, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/reviews", (req, res) => {
    const { job_id, customer_id, worker_id, rating, comment } = req.body;
    try {
      // Check if a review already exists for this job
      const existing = db.prepare("SELECT id FROM reviews WHERE job_id = ?").get(job_id);
      if (existing) {
        return res.status(400).json({ error: "Review already submitted for this job" });
      }

      db.prepare(`
        INSERT INTO reviews (job_id, customer_id, worker_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `).run(job_id, customer_id, worker_id, rating, comment);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/workers/:id/reviews", (req, res) => {
    const reviews = db.prepare(`
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.worker_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.id);
    res.json(reviews);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
