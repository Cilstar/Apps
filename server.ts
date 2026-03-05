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
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS job_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    worker_id INTEGER NOT NULL,
    service_type TEXT NOT NULL,
    description TEXT,
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
    const { customer_id, worker_id, service_type, description, latitude, longitude } = req.body;
    try {
      const result = db.prepare("INSERT INTO job_requests (customer_id, worker_id, service_type, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)").run(customer_id, worker_id, service_type, description, latitude, longitude);
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

startServer();
