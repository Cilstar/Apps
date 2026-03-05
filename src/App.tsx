import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  Hammer, 
  User as UserIcon, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Phone,
  MessageSquare,
  CreditCard,
  Search,
  Settings,
  ShieldCheck,
  Camera,
  Calendar,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, WorkerProfile, JobRequest, SERVICE_CATEGORIES, ServiceCategory } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORY_IMAGES: Record<ServiceCategory, string> = {
  'Plumbing': 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800',
  'Electrical': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
  'Carpentry': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800',
  'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=800',
  'Painting': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
  'Technician': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800'
};

// --- Components ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Hammer className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">HandsOn</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Dashboard</Link>
                {user.role === 'customer' && (
                  <Link to="/find-worker" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Find Help</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Admin Panel</Link>
                )}
                <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900">{user.name}</p>
                    <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-600 hover:text-emerald-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Join as Worker
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-500 p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-b border-zinc-200 px-4 pt-2 pb-6 space-y-2"
          >
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-zinc-50">Dashboard</Link>
                {user.role === 'customer' && (
                  <Link to="/find-worker" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-zinc-50">Find Help</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-zinc-50">Admin Panel</Link>
                )}
                <button onClick={onLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:bg-zinc-50">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50">Register</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Home = () => (
  <div className="relative overflow-hidden">
    {/* Hero Section */}
    <div className="relative bg-zinc-900 py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <img 
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=2000" 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-900/80 to-zinc-900" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-8 backdrop-blur-sm">
            <MapPin className="w-4 h-4 mr-2" /> Serving Roysambu & Nairobi
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
            Your Home, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Perfectly Maintained.</span>
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Instantly connect with the best local experts. From leaky pipes to complex wiring, 
            we've got the right hands for every job.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/find-worker" className="bg-emerald-500 text-zinc-900 px-10 py-5 rounded-2xl text-lg font-black hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/20 active:scale-95">
              Get Started Now
            </Link>
            <Link to="/register" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl text-lg font-black hover:bg-white/20 transition-all active:scale-95">
              Become a Pro
            </Link>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Categories Grid */}
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tight">Popular Services</h2>
            <p className="text-zinc-500 mt-2 text-lg">Top-rated professionals ready to help.</p>
          </div>
          <Link to="/find-worker" className="text-emerald-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View all services <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <Link 
              key={cat} 
              to={`/find-worker?category=${cat}`}
              className="group relative h-48 rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <img 
                src={CATEGORY_IMAGES[cat]} 
                alt={cat} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-lg">{cat}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>

    {/* Features */}
    <div className="bg-emerald-600 py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -ml-48 -mb-48" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white tracking-tight">Why HandsOn?</h2>
          <p className="text-emerald-100 mt-4 text-lg">We're building the future of local services.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: 'Verified Pros', 
              desc: 'Rigorous background checks and skill assessments for your peace of mind.',
              icon: ShieldCheck,
              bg: 'bg-white/10'
            },
            { 
              title: 'Instant Booking', 
              desc: 'No more endless calls. Book your service in seconds with upfront pricing.',
              icon: Clock,
              bg: 'bg-white/10'
            },
            { 
              title: 'Secure Payments', 
              desc: 'Integrated M-Pesa payments ensure your money is safe until the job is done.',
              icon: CreditCard,
              bg: 'bg-white/10'
            }
          ].map((feature, i) => (
            <div key={i} className={cn("p-10 rounded-[2.5rem] border border-white/20 backdrop-blur-sm", feature.bg)}>
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-xl">
                <feature.icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-emerald-50/80 text-lg leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Connection failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Welcome Back</h2>
          <p className="text-zinc-500 mt-2">Login to your HandsOn account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 mt-4"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-8">
          Don't have an account? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

const Register = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [role, setRole] = useState<'customer' | 'worker'>('customer');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    category: 'Plumbing', experience_years: 0, bio: '', hourly_rate: 1000
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role })
      });
      const data = await res.json();
      if (data.success) {
        // Auto login after register
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const loginData = await loginRes.json();
        onLogin(loginData.user);
        navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-zinc-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-zinc-900">Create Account</h2>
          <p className="text-zinc-500 mt-2">Join the HandsOn community today</p>
        </div>

        <div className="flex p-1 bg-zinc-100 rounded-xl mb-8">
          <button 
            onClick={() => setRole('customer')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              role === 'customer' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            I'm a Customer
          </button>
          <button 
            onClick={() => setRole('worker')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              role === 'worker' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            I'm a Worker
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
            <input 
              type="text" required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input 
              type="email" required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Phone (M-Pesa)</label>
            <input 
              type="tel" required 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="0712345678"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input 
              type="password" required 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {role === 'worker' && (
            <>
              <div className="md:col-span-2 border-t border-zinc-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Professional Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Hourly Rate (KES)</label>
                <input 
                  type="number" required 
                  value={formData.hourly_rate}
                  onChange={e => setFormData({...formData, hourly_rate: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Bio / Experience</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Tell customers about your skills..."
                />
              </div>
            </>
          )}

          <button 
            type="submit"
            className="md:col-span-2 bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 mt-6"
          >
            Create Account
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const FindWorker = ({ user }: { user: User }) => {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkers();
  }, [category]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workers${category ? `?category=${category}` : ''}`);
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedWorker) return;
    setBooking(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.id,
          worker_id: selectedWorker.id,
          service_type: selectedWorker.category,
          description: jobDescription,
          preferred_datetime: preferredDate,
          urgency,
          photos: JSON.stringify(photos),
          latitude: 0, // Mock
          longitude: 0 // Mock
        })
      });
      if (res.ok) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Categories</h2>
          <div className="space-y-1">
            <button 
              onClick={() => setCategory('')}
              className={cn(
                "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                category === '' ? "bg-emerald-50 text-emerald-700" : "text-zinc-600 hover:bg-zinc-50"
              )}
            >
              All Services
            </button>
            {SERVICE_CATEGORIES.map(c => (
              <button 
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  category === c ? "bg-emerald-50 text-emerald-700" : "text-zinc-600 hover:bg-zinc-50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">
              {category || 'All'} Workers Nearby
            </h1>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search by name..."
                className="pl-10 pr-4 py-2 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No workers found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {workers.map(worker => (
                <motion.div 
                  key={worker.id}
                  layoutId={`worker-${worker.id}`}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="h-40 bg-zinc-100 relative">
                    <img 
                      src={CATEGORY_IMAGES[worker.category as ServiceCategory] || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12'} 
                      alt={worker.category}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute -bottom-8 left-6">
                      <div className="w-20 h-20 rounded-3xl bg-white p-1.5 shadow-xl border border-zinc-100">
                        <div className="w-full h-full rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                          {worker.profile_photo ? (
                            <img src={worker.profile_photo} alt={worker.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <img 
                              src={`https://picsum.photos/seed/${worker.id}/200`} 
                              alt={worker.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-zinc-900">{worker.name}</h3>
                          {worker.is_verified && (
                            <div className="bg-emerald-100 text-emerald-700 p-0.5 rounded-full" title="Verified Professional">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-emerald-600 font-semibold">{worker.category}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-zinc-700">{worker.avg_rating?.toFixed(1) || 'New'}</span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{worker.bio}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Rate</p>
                        <p className="text-lg font-bold text-zinc-900">KES {worker.hourly_rate}<span className="text-xs text-zinc-400 font-normal">/hr</span></p>
                      </div>
                      <button 
                        onClick={() => setSelectedWorker(worker)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedWorker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWorker(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                      <UserIcon className="w-8 h-8 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-zinc-900">Book {selectedWorker.name}</h2>
                        {selectedWorker.is_verified && (
                          <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-emerald-600 font-semibold">{selectedWorker.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">Job Description</label>
                    <textarea 
                      rows={3}
                      value={jobDescription}
                      onChange={e => setJobDescription(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      placeholder="Describe the issue or task in detail..."
                    />
                  </div>

                  {selectedWorker.portfolio && JSON.parse(selectedWorker.portfolio).length > 0 && (
                    <div>
                      <label className="block text-sm font-bold text-zinc-900 mb-2">Portfolio / Past Work</label>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {JSON.parse(selectedWorker.portfolio).map((img: string, i: number) => (
                          <img 
                            key={i} 
                            src={img} 
                            className="w-32 h-32 rounded-xl object-cover border border-zinc-100 flex-shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" /> Preferred Date & Time
                      </label>
                      <input 
                        type="datetime-local"
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-600" /> Urgency Level
                      </label>
                      <select 
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      >
                        <option value="low">Low - No rush</option>
                        <option value="medium">Medium - Within 24h</option>
                        <option value="high">High - Same day</option>
                        <option value="emergency">Emergency - ASAP</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-600" /> Attach Photos
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {photos.map((p, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200">
                          <img src={p} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-zinc-900/50 text-white p-1 rounded-full hover:bg-zinc-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setPhotos([...photos, `https://picsum.photos/seed/${Math.random()}/400/300`])}
                        className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                      >
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">Add Photo</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Hourly Rate</span>
                      <span className="font-bold text-zinc-900">KES {selectedWorker.hourly_rate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Service Fee</span>
                      <span className="font-bold text-zinc-900">KES 100</span>
                    </div>
                    <div className="pt-3 border-t border-zinc-200 flex justify-between">
                      <span className="font-bold text-zinc-900">Total Estimate</span>
                      <span className="font-bold text-emerald-600">KES {selectedWorker.hourly_rate + 100}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleBook}
                    disabled={booking || !jobDescription}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {booking ? 'Sending Request...' : 'Confirm Request'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ user }: { user: User }) => {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [updatingPortfolio, setUpdatingPortfolio] = useState(false);

  useEffect(() => {
    fetchJobs();
    if (user.role === 'worker' && user.workerProfile?.portfolio) {
      setPortfolio(JSON.parse(user.workerProfile.portfolio));
    }
  }, [user]);

  const updatePortfolio = async (newPortfolio: string[]) => {
    if (!user.workerProfile) return;
    setUpdatingPortfolio(true);
    try {
      const res = await fetch(`/api/workers/${user.workerProfile.id}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio: newPortfolio })
      });
      if (res.ok) {
        setPortfolio(newPortfolio);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingPortfolio(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const endpoint = user.role === 'customer' ? `/api/jobs/customer/${user.id}` : `/api/jobs/worker/${user.workerProfile?.id}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (jobId: number, status: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async (job: JobRequest) => {
    setPaying(job.id);
    try {
      const res = await fetch('/api/payments/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          amount: 1100, // Mock
          phone: user.phone
        })
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'declined':
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Welcome, {user.name}</h1>
          <p className="text-zinc-500">Manage your {user.role === 'customer' ? 'service requests' : 'jobs'} and payments.</p>
        </div>
        {user.role === 'customer' && (
          <Link to="/find-worker" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
            Book New Service
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Jobs List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-bold text-zinc-900">Recent Activity</h2>
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-500">Loading your jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-zinc-300" />
                </div>
                <p className="text-zinc-500 font-medium">No activity yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {jobs.map(job => (
                  <div key={job.id} className="p-6 hover:bg-zinc-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <Hammer className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900">{job.service_type}</h3>
                          <p className="text-sm text-zinc-500">
                            {user.role === 'customer' ? `Worker: ${job.worker_name}` : `Customer: ${job.customer_name}`}
                          </p>
                        </div>
                      </div>
                      <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", getStatusColor(job.status))}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-4 mb-6">
                      <p className="text-sm text-zinc-600 bg-white p-3 rounded-xl border border-zinc-100">
                        {job.description}
                      </p>
                      
                      {(job.preferred_datetime || job.urgency || job.photos) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {job.preferred_datetime && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100/50 p-2 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-bold">Scheduled:</span> {new Date(job.preferred_datetime).toLocaleString()}
                            </div>
                          )}
                          {job.urgency && (
                            <div className={cn(
                              "flex items-center gap-2 text-xs p-2 rounded-lg font-bold",
                              job.urgency === 'emergency' ? "bg-red-50 text-red-600" :
                              job.urgency === 'high' ? "bg-orange-50 text-orange-600" :
                              "bg-zinc-100/50 text-zinc-500"
                            )}>
                              <Zap className="w-3.5 h-3.5" />
                              <span className="uppercase tracking-wider">Urgency: {job.urgency}</span>
                            </div>
                          )}
                          {job.photos && JSON.parse(job.photos).length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Attached Photos</p>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {JSON.parse(job.photos).map((p: string, i: number) => (
                                  <img key={i} src={p} className="w-16 h-16 rounded-lg object-cover border border-zinc-200 flex-shrink-0" referrerPolicy="no-referrer" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        {user.role === 'worker' && job.customer_phone && (
                          <a href={`tel:${job.customer_phone}`} className="flex items-center gap-1 text-emerald-600 hover:underline">
                            <Phone className="w-4 h-4" />
                            {job.customer_phone}
                          </a>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {user.role === 'worker' && job.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateStatus(job.id, 'accepted')}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => updateStatus(job.id, 'declined')}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {user.role === 'worker' && job.status === 'accepted' && (
                          <button 
                            onClick={() => updateStatus(job.id, 'in_progress')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                          >
                            Start Job
                          </button>
                        )}
                        {user.role === 'customer' && job.status === 'in_progress' && (
                          <button 
                            onClick={() => handlePayment(job)}
                            disabled={paying === job.id}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                          >
                            <CreditCard className="w-4 h-4" />
                            {paying === job.id ? 'Processing...' : 'Pay via M-Pesa'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden">
                <UserIcon className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">{user.name}</h3>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Phone</span>
                <span className="font-medium text-zinc-900">{user.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Account Type</span>
                <span className="font-medium text-zinc-900 capitalize">{user.role}</span>
              </div>
              {user.role === 'worker' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Category</span>
                    <span className="font-medium text-emerald-600">{user.workerProfile?.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Verified</span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" /> Yes
                    </span>
                  </div>
                </>
              )}
            </div>
            <button className="w-full mt-6 py-2 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Quick Stats */}
          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
            <h3 className="font-bold mb-4">Account Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <p className="text-xs text-emerald-100 uppercase font-bold tracking-wider mb-1">Completed</p>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'completed').length}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl">
                <p className="text-xs text-emerald-100 uppercase font-bold tracking-wider mb-1">Active</p>
                <p className="text-2xl font-bold">{jobs.filter(j => ['accepted', 'in_progress'].includes(j.status)).length}</p>
              </div>
            </div>
          </div>

          {/* Portfolio Management for Workers */}
          {user.role === 'worker' && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900">My Portfolio</h3>
                <button 
                  onClick={() => updatePortfolio([...portfolio, `https://picsum.photos/seed/${Math.random()}/800/600`])}
                  disabled={updatingPortfolio}
                  className="text-emerald-600 p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {portfolio.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-100 group">
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button 
                      onClick={() => updatePortfolio(portfolio.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {portfolio.length === 0 && (
                  <div className="col-span-2 py-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                    <p className="text-xs text-zinc-400">No portfolio images yet.</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 mt-4 italic">Showcase your best work to attract more customers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/jobs')
      ]);
      const [statsData, usersData, jobsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        jobsRes.json()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setJobs(jobsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (workerId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: !currentStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Admin Control Center</h1>
        <p className="text-zinc-500">Real-time platform monitoring and management.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: stats?.users, icon: UserIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Workers', value: stats?.workers, icon: Hammer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Jobs', value: stats?.jobs, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Revenue', value: `KES ${stats?.revenue}`, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="font-bold text-zinc-900">Recent Registrations</h2>
            <Link to="#" className="text-xs font-bold text-emerald-600 hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {users.slice(0, 5).map((u: any) => (
              <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{u.name}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    u.role === 'worker' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {u.role}
                  </span>
                  {u.role === 'worker' && (
                    <button 
                      onClick={() => toggleVerify(u.worker_id, !!u.is_verified)}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        u.is_verified ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                      )}
                      title={u.is_verified ? "Unverify Worker" : "Verify Worker"}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="font-bold text-zinc-900">Platform Activity</h2>
            <Link to="#" className="text-xs font-bold text-emerald-600 hover:underline">Live Feed</Link>
          </div>
          <div className="divide-y divide-zinc-100">
            {jobs.slice(0, 5).map((j: any) => (
              <div key={j.id} className="px-6 py-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-bold text-zinc-900">{j.service_type}</p>
                  <span className="text-[10px] font-bold text-zinc-400">{new Date(j.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-700">{j.customer_name}</span> → <span className="font-semibold text-zinc-700">{j.worker_name}</span>
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    j.status === 'completed' ? "bg-emerald-500" : "bg-yellow-500"
                  )} />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{j.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('handson_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('handson_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('handson_user');
  };

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/find-worker" element={user?.role === 'customer' ? <FindWorker user={user} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <footer className="bg-zinc-50 border-t border-zinc-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <Hammer className="w-6 h-6 text-emerald-600" />
                <span className="text-xl font-bold tracking-tight text-zinc-900">HandsOn</span>
              </div>
              <div className="flex gap-8 text-sm font-medium text-zinc-500">
                <a href="#" className="hover:text-emerald-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Contact Support</a>
              </div>
              <p className="text-sm text-zinc-400">© 2024 HandsOn Kenya. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
