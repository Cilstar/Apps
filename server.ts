import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("handson.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('customer', 'worker', 'admin')) NOT NULL,
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
    FOREIGN KEY (user_id) REFERENCES users(id)
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

// Seeding Logic
const seedData = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    console.log("Seeding database with Kenyan examples...");
    
    const sampleWorkers = [
      { name: "James Kamau", email: "kamau@example.com", phone: "0712345678", category: "Plumbing", bio: "Expert plumber with 10 years experience in Roysambu. Specializes in leak detection and bathroom fittings.", rate: 1200, verified: 1, portfolio: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a', 'https://images.unsplash.com/photo-1504148455328-c376907d081c'] },
      { name: "Mary Atieno", email: "mary@example.com", phone: "0722345678", category: "Cleaning", bio: "Professional deep cleaning services for homes and offices. Very thorough and reliable.", rate: 800, verified: 1, portfolio: ['https://images.unsplash.com/photo-1581578731548-c64695cc6958', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac'] },
      { name: "David Omondi", email: "david@example.com", phone: "0733345678", category: "Electrical", bio: "Certified electrician. I handle house wiring, socket repairs, and solar installations.", rate: 1500, verified: 0, portfolio: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e', 'https://images.unsplash.com/photo-1558211583-d28f610b15a0'] },
      { name: "Sarah Njeri", email: "sarah@example.com", phone: "0744345678", category: "Painting", bio: "Creative painter and interior decorator. I bring life to your walls with quality finishes.", rate: 1000, verified: 1, portfolio: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f', 'https://images.unsplash.com/photo-1562664377-709f2c337eb2'] },
      { name: "Peter Kipkorir", email: "peter@example.com", phone: "0755345678", category: "Carpentry", bio: "Custom furniture maker and repair expert. Quality woodwork guaranteed.", rate: 1300, verified: 0, portfolio: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85'] },
      { name: "Faith Wambui", email: "faith@example.com", phone: "0766345678", category: "Technician", bio: "Appliance repair specialist. I fix fridges, microwaves, and washing machines.", rate: 1100, verified: 1, portfolio: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837'] }
    ];

    for (const w of sampleWorkers) {
      const userResult = db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, 'password123', 'worker')").run(w.name, w.email, w.phone);
      const userId = userResult.lastInsertRowid;
      db.prepare("INSERT INTO workers (user_id, category, experience_years, bio, hourly_rate, is_verified, portfolio) VALUES (?, ?, ?, ?, ?, ?, ?)").run(userId, w.category, 5, w.bio, w.rate, w.verified, JSON.stringify(w.portfolio));
    }

    // Add a sample customer
    db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, 'password123', 'customer')").run("Sylvester Omondi", "omondi@example.com", "0700123456");
    
    // Add an admin user
    db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, 'admin123', 'admin')").run("Admin User", "admin@handson.com", "0700000000");
    
    console.log("Seeding complete.");
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
      SELECT u.name, u.phone, w.*, 
      (SELECT AVG(rating) FROM reviews WHERE worker_id = w.id) as avg_rating
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
      SELECT j.*, u.name as worker_name, w.category
      FROM job_requests j
      JOIN workers w ON j.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      WHERE j.customer_id = ?
      ORDER BY j.created_at DESC
    `).all(req.params.id);
    res.json(jobs);
  });

  app.get("/api/jobs/worker/:id", (req, res) => {
    const jobs = db.prepare(`
      SELECT j.*, u.name as customer_name, u.phone as customer_phone
      FROM job_requests j
      JOIN users u ON j.customer_id = u.id
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
      SELECT u.*, w.id as worker_id, w.is_verified, w.category
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
