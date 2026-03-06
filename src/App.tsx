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
  Zap,
  LayoutGrid,
  BarChart3,
  Ban,
  AlertTriangle,
  Plus,
  Sparkles,
  Palette,
  Cpu,
  Droplets
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { User, WorkerProfile, JobRequest, SERVICE_CATEGORIES, ServiceCategory, Review } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'sonner';

const socket = io();

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

const ReviewModal = ({ isOpen, onClose, job, onSubmit }: { 
  isOpen: boolean, 
  onClose: () => void, 
  job: JobRequest,
  onSubmit: (rating: number, comment: string) => void 
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(rating, comment);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-zinc-900">Rate your experience</h3>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>

          <p className="text-zinc-500 mb-8">How was the service provided by <span className="font-bold text-zinc-900">{job.worker_name}</span>?</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={cn(
                      "w-10 h-10 transition-colors",
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"
                    )} 
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Your feedback (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200 py-2 shadow-sm" : "bg-transparent py-4"
    )}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-emerald-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-200">
                <Hammer className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-zinc-900">HandsOn</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-bold text-zinc-600 hover:text-emerald-600 transition-colors">Dashboard</Link>
                {user.role === 'customer' && (
                  <Link to="/find-worker" className="text-sm font-bold text-zinc-600 hover:text-emerald-600 transition-colors">Find Help</Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-bold text-zinc-600 hover:text-emerald-600 transition-colors">Admin Panel</Link>
                )}
                <div className="flex items-center gap-4 pl-8 border-l border-zinc-200">
                  <div className="text-right">
                    <p className="text-sm font-black text-zinc-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200 shadow-sm">
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                  <button 
                    onClick={onLogout}
                    className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-emerald-600 transition-colors">Login</Link>
                <Link to="/register" className="bg-zinc-900 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]">
                  Join as Worker
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-zinc-500 p-2.5 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-bold text-zinc-700 hover:bg-zinc-50">Dashboard</Link>
                  {user.role === 'customer' && (
                    <Link to="/find-worker" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-bold text-zinc-700 hover:bg-zinc-50">Find Help</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-bold text-zinc-700 hover:bg-zinc-50">Admin Panel</Link>
                  )}
                  <div className="pt-4 border-t border-zinc-100">
                    <button onClick={onLogout} className="w-full text-left block px-4 py-3 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-bold text-zinc-700 hover:bg-zinc-50">Login</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-bold bg-zinc-900 text-white text-center">Join as Worker</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 sm:pt-32 sm:pb-40">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[50%] top-0 h-[64rem] w-[128rem] -translate-x-[50%] stroke-zinc-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
            <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <pattern id="hero-pattern" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                  <path d="M100 200V.5M.5 .5H200" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-pattern)" />
            </svg>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100 mb-8">
                <Sparkles className="w-4 h-4" />
                Kenya's #1 Trusted Service Platform
              </span>
              <h1 className="text-5xl sm:text-7xl font-black text-zinc-900 tracking-tight mb-8">
                Expert Help, <br />
                <span className="text-emerald-600">Right at Your Door.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-500 leading-relaxed mb-12">
                Connect with verified local professionals for plumbing, electrical, cleaning, and more. 
                Fast, reliable, and secure payments via M-Pesa.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/find-worker" className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98]">
                  Find a Professional
                </Link>
                <Link to="/register" className="w-full sm:w-auto bg-white text-zinc-900 px-8 py-4 rounded-2xl font-bold text-lg border border-zinc-200 hover:bg-zinc-50 transition-all active:scale-[0.98]">
                  Join as a Worker
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="py-24 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900 mb-2">Popular Services</h2>
              <p className="text-zinc-500">Explore our wide range of professional services.</p>
            </div>
            <Link to="/find-worker" className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <Link 
                key={cat} 
                to={`/find-worker?category=${cat}`}
                className="group bg-white p-6 rounded-3xl border border-zinc-200 hover:border-emerald-500 hover:shadow-xl transition-all text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {cat === 'Plumbing' && <Droplets className="w-6 h-6" />}
                  {cat === 'Electrical' && <Zap className="w-6 h-6" />}
                  {cat === 'Carpentry' && <Hammer className="w-6 h-6" />}
                  {cat === 'Cleaning' && <Sparkles className="w-6 h-6" />}
                  {cat === 'Painting' && <Palette className="w-6 h-6" />}
                  {cat === 'Technician' && <Cpu className="w-6 h-6" />}
                </div>
                <span className="font-bold text-zinc-900">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black text-zinc-900 tracking-tight mb-8">
                Why thousands trust <br />
                <span className="text-emerald-600">HandsOn Kenya</span>
              </h2>
              <div className="space-y-8">
                {[
                  { title: 'Verified Professionals', desc: 'Every worker undergoes a rigorous background check and document verification.', icon: ShieldCheck },
                  { title: 'Secure M-Pesa Payments', desc: 'Pay only when the job is done. Your money is safe with our secure escrow system.', icon: CreditCard },
                  { title: 'Real-time Tracking', desc: 'Track your service request status in real-time from booking to completion.', icon: Clock },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 mb-1">{item.title}</h3>
                      <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] bg-zinc-100 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6958?auto=format&fit=crop&q=80&w=1000" 
                  alt="Service Professional" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl border border-zinc-100 max-w-xs">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i}/100`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-zinc-900">10k+ Happy Users</div>
                </div>
                <p className="text-sm text-zinc-500 italic">"The best service I've ever used in Nairobi. Fast and reliable!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
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
    category: 'Plumbing', experience_years: 0, bio: '', location: '', hourly_rate: 1000
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
                <label className="block text-sm font-medium text-zinc-700 mb-1">Location / Area</label>
                <input 
                  type="text" required 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Roysambu, Kasarani"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [bookingStep, setBookingStep] = useState<'profile' | 'booking' | 'confirmation'>('profile');
  const [jobDescription, setJobDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'emergency'>('medium');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [booking, setBooking] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const navigate = useNavigate();

  const [recentJobs, setRecentJobs] = useState([
    { id: 1, service: 'Plumbing', area: 'Roysambu', time: '2 mins ago' },
    { id: 2, service: 'Electrical', area: 'Westlands', time: '5 mins ago' },
    { id: 3, service: 'Cleaning', area: 'Kasarani', time: '12 mins ago' },
  ]);

  useEffect(() => {
    fetchWorkers();
  }, [category]);

  useEffect(() => {
    if (selectedWorker) {
      fetchReviews(selectedWorker.id);
    } else {
      setReviews([]);
    }
  }, [selectedWorker]);

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

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         w.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationQuery || 
                           w.location?.toLowerCase().includes(locationQuery.toLowerCase()) ||
                           w.bio?.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  const fetchReviews = async (workerId: number) => {
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/reviews`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newPhotos: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push(reader.result as string);
        processed++;
        if (processed === files.length) {
          setPhotos(prev => [...prev, ...newPhotos]);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBook = async () => {
    if (!selectedWorker || !jobDescription || !preferredDate) return;
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
        // Reset form
        setJobDescription('');
        setPreferredDate('');
        setUrgency('medium');
        setPhotos([]);
        setSelectedWorker(null);
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

          {/* Live Feed */}
          <div className="mt-12 p-6 bg-zinc-900 rounded-[2rem] text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Activity</h3>
            </div>
            <div className="space-y-4">
              {recentJobs.map(job => (
                <div key={job.id} className="border-l-2 border-white/10 pl-4 py-1">
                  <p className="text-xs font-bold">{job.service} requested</p>
                  <p className="text-[10px] text-zinc-400">{job.area} • {job.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                {category || 'All'} Professionals
              </h1>
              <p className="text-zinc-500">Find the best hands for your task in {locationQuery || 'Nairobi'}.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex bg-zinc-100 p-1 rounded-2xl mr-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    viewMode === 'grid' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    viewMode === 'map' ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
              <div className="relative flex-1 sm:w-64">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name or service..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                />
              </div>
              <div className="relative flex-1 sm:w-64">
                <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="Enter your area..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="bg-zinc-100 rounded-[2.5rem] h-[600px] relative overflow-hidden border border-zinc-200 shadow-inner">
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" viewBox="0 0 800 600">
                  <path d="M0 0h800v600H0z" fill="#fff" />
                  <path d="M100 100l200 50 150-50 200 100-50 200-200 50-200-50z" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                  <circle cx="400" cy="300" r="200" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                </svg>
              </div>
              {filteredWorkers.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute cursor-pointer group"
                  style={{ 
                    left: `${20 + (i * 15) % 60}%`, 
                    top: `${20 + (i * 20) % 60}%` 
                  }}
                  onClick={() => setSelectedWorker(w)}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border-2 border-emerald-500 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
                      <img src={w.profile_photo || `https://picsum.photos/seed/${w.id}/100`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {w.name} • KES {w.hourly_rate}/hr
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="absolute bottom-8 left-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
                <p className="text-xs font-bold text-zinc-900 mb-1">Service Area: Nairobi</p>
                <p className="text-[10px] text-zinc-500">{filteredWorkers.length} professionals available nearby</p>
              </div>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
              <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No workers found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map(worker => (
                <motion.div 
                  key={worker.id}
                  layoutId={`worker-${worker.id}`}
                  className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() => {
                    setSelectedWorker(worker);
                    setBookingStep('profile');
                  }}
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
                          <div className="flex items-center gap-1.5">
                            {worker.is_online ? (
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Online
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-zinc-50 text-zinc-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-100">
                                <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full" />
                                Offline
                              </div>
                            )}
                            {worker.is_verified && (
                              <div className="bg-emerald-100 text-emerald-700 p-0.5 rounded-full" title="Verified Professional">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-emerald-600 font-semibold">{worker.category}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-zinc-400" />
                          <span className="text-xs text-zinc-500">{worker.location || 'Nairobi'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Available for Hire</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-zinc-700">
                          {worker.avg_rating ? Number(worker.avg_rating).toFixed(1) : 'New'}
                        </span>
                        {worker.review_count !== undefined && worker.review_count > 0 && (
                          <span className="text-[10px] text-zinc-400 font-medium">
                            ({worker.review_count})
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{worker.bio}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                      <div>
                        <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Rate</p>
                        <p className="text-lg font-bold text-zinc-900">KES {worker.hourly_rate}<span className="text-xs text-zinc-400 font-normal">/hr</span></p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorker(worker);
                          setBookingStep('booking');
                        }}
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
                      {selectedWorker.profile_photo ? (
                        <img src={selectedWorker.profile_photo} alt={selectedWorker.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-8 h-8 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-zinc-900">{selectedWorker.name}</h2>
                        {selectedWorker.is_verified && (
                          <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </div>
                        )}
                      </div>
                      <p className="text-emerald-600 font-semibold">{selectedWorker.category}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-zinc-700">
                          {selectedWorker.avg_rating ? Number(selectedWorker.avg_rating).toFixed(1) : 'New'}
                        </span>
                        <span className="text-xs text-zinc-400">({selectedWorker.review_count || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedWorker(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                  {bookingStep === 'profile' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">About the Professional</h3>
                        <p className="text-zinc-600 leading-relaxed">{selectedWorker.bio}</p>
                      </div>

                      {selectedWorker.portfolio && JSON.parse(selectedWorker.portfolio).length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Portfolio</h3>
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {JSON.parse(selectedWorker.portfolio).map((img: string, i: number) => (
                              <img 
                                key={i} 
                                src={img} 
                                className="w-40 h-40 rounded-2xl object-cover border border-zinc-100 flex-shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">Customer Reviews</h3>
                        {loadingReviews ? (
                          <div className="py-8 text-center">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                            <p className="text-sm text-zinc-400 italic">No reviews yet for this professional.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {reviews.map((r) => (
                              <div key={r.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold">
                                      {r.customer_name?.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-900">{r.customer_name}</span>
                                  </div>
                                  <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={cn("w-3 h-3", i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200")} />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-zinc-600 leading-relaxed">{r.comment}</p>
                                <p className="text-[10px] text-zinc-400 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-zinc-100">
                        <button 
                          onClick={() => setBookingStep('booking')}
                          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                        >
                          Continue to Booking
                        </button>
                      </div>
                    </div>
                  )}

                  {bookingStep === 'booking' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <button 
                          onClick={() => setBookingStep('profile')}
                          className="text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h3 className="text-lg font-bold text-zinc-900">Job Details</h3>
                      </div>

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
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                        />
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
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all disabled:opacity-50"
                          >
                            {uploading ? (
                              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <Camera className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-bold">Add Photo</span>
                              </>
                            )}
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
                        onClick={() => setBookingStep('confirmation')}
                        disabled={!jobDescription || !preferredDate}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Review Request
                      </button>
                    </div>
                  )}

                  {bookingStep === 'confirmation' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <button 
                          onClick={() => setBookingStep('booking')}
                          className="text-zinc-400 hover:text-zinc-900 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <h3 className="text-lg font-bold text-zinc-900 text-center flex-1">Review Your Request</h3>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Worker</p>
                            <p className="text-sm font-bold text-zinc-900">{selectedWorker.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Service</p>
                            <p className="text-sm font-bold text-zinc-900">{selectedWorker.category}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Date & Time</p>
                            <p className="text-sm font-bold text-zinc-900">{new Date(preferredDate).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Urgency</p>
                            <p className="text-sm font-bold text-zinc-900 capitalize">{urgency}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Description</p>
                          <p className="text-sm text-zinc-700 leading-relaxed">{jobDescription}</p>
                        </div>

                        {photos.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Attached Photos ({photos.length})</p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {photos.map((p, i) => (
                                <img key={i} src={p} className="w-12 h-12 rounded-lg object-cover border border-emerald-200" />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-4 border-t border-emerald-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-emerald-700">Total Estimate</span>
                            <span className="text-xl font-black text-emerald-600">KES {selectedWorker.hourly_rate + 100}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={handleBook}
                          disabled={booking}
                          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                          {booking ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Confirm & Send Request
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => setBookingStep('booking')}
                          className="w-full py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                          Edit Details
                        </button>
                      </div>
                    </div>
                  )}
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
  const [documents, setDocuments] = useState<string[]>([]);
  const [updatingPortfolio, setUpdatingPortfolio] = useState(false);
  const [updatingDocuments, setUpdatingDocuments] = useState(false);
  const [prevJobs, setPrevJobs] = useState<JobRequest[]>([]);
  const [reviewingJob, setReviewingJob] = useState<JobRequest | null>(null);

  useEffect(() => {
    if (user.role === 'customer' && jobs.length > 0 && prevJobs.length > 0) {
      const newlyCompleted = jobs.find(job => {
        const prevJob = prevJobs.find(pj => pj.id === job.id);
        return job.status === 'completed' && !job.is_reviewed && prevJob && prevJob.status !== 'completed';
      });
      if (newlyCompleted && !reviewingJob) {
        setReviewingJob(newlyCompleted);
      }
    }
    setPrevJobs(jobs);
  }, [jobs, user.role]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // Poll every 10s
    if (user.role === 'worker' && user.workerProfile) {
      if (user.workerProfile.portfolio) setPortfolio(JSON.parse(user.workerProfile.portfolio));
      if (user.workerProfile.documents) setDocuments(JSON.parse(user.workerProfile.documents));
    }
    return () => clearInterval(interval);
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
      if (res.ok) setPortfolio(newPortfolio);
    } catch (err) { console.error(err); } finally { setUpdatingPortfolio(false); }
  };

  const updateDocuments = async (newDocs: string[]) => {
    if (!user.workerProfile) return;
    setUpdatingDocuments(true);
    try {
      const res = await fetch(`/api/workers/${user.workerProfile.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: newDocs })
      });
      if (res.ok) setDocuments(newDocs);
    } catch (err) { console.error(err); } finally { setUpdatingDocuments(false); }
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
      if (res.ok) {
        await fetchJobs();
        setReviewingJob(job);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(null);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!reviewingJob) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: reviewingJob.id,
          customer_id: user.id,
          worker_id: reviewingJob.worker_id,
          rating,
          comment
        })
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">
            Welcome back, <span className="text-emerald-600">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-zinc-500 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {user.role === 'customer' ? 'Your home is in good hands.' : 'You have 3 new job opportunities today.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'customer' && (
            <Link to="/find-worker" className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Book Service
            </Link>
          )}
          <button className="p-4 bg-white border border-zinc-200 rounded-2xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Jobs List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Spent</p>
              <p className="text-2xl font-black text-zinc-900">KES 12,450</p>
              <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <ChevronRight className="w-3 h-3 rotate-[-90deg]" /> +12% from last month
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Active Jobs</p>
              <p className="text-2xl font-black text-zinc-900">{jobs.filter(j => ['accepted', 'in_progress'].includes(j.status)).length}</p>
              <div className="mt-2 flex items-center gap-1 text-zinc-400 text-xs font-bold">
                Currently in progress
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Saved Pros</p>
              <p className="text-2xl font-black text-zinc-900">8</p>
              <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                View favorites
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="font-black text-zinc-900 tracking-tight">Recent Activity</h2>
              <div className="flex bg-zinc-200/50 p-1 rounded-xl">
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-900 shadow-sm">All</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-900">Active</button>
              </div>
            </div>
            
            {loading ? (
              <div className="p-20 text-center">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-zinc-500 font-medium">Syncing your activity...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-zinc-200" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">No activity yet</h3>
                <p className="text-zinc-500 max-w-xs mx-auto mb-8">Start your first project by finding a professional near you.</p>
                <Link to="/find-worker" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
                  Browse Services <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {jobs.map(job => (
                  <div key={job.id} className="p-8 hover:bg-zinc-50/50 transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                      <div className="flex gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-emerald-600 overflow-hidden border border-zinc-200 shadow-sm group-hover:scale-105 transition-transform">
                          {user.role === 'customer' && job.profile_photo ? (
                            <img src={job.profile_photo} alt={job.worker_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Hammer className="w-8 h-8" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-zinc-900 tracking-tight">{job.service_type}</h3>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              getStatusColor(job.status).replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-')
                            )}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-3">
                            <p className="font-medium">
                              {user.role === 'customer' ? `Worker: ${job.worker_name}` : `Customer: ${job.customer_name}`}
                            </p>
                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                            <p className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm text-zinc-500 line-clamp-1 max-w-md italic">"{job.description}"</p>
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
                        {user.role === 'worker' && job.status === 'in_progress' && (
                          <button 
                            onClick={() => updateStatus(job.id, 'completed')}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700"
                          >
                            Mark as Completed
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
                        {user.role === 'customer' && job.status === 'completed' && !job.is_reviewed && (
                          <button 
                            onClick={() => setReviewingJob(job)}
                            className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-100 transition-colors"
                          >
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            Rate Service
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
                {user.profile_photo ? (
                  <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-8 h-8 text-zinc-400" />
                )}
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
                  <div className="pt-4 border-t border-zinc-100 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Availability</p>
                        <p className="text-[10px] text-zinc-500">Visible to customers</p>
                      </div>
                      <button 
                        onClick={async () => {
                          if (!user.workerProfile) return;
                          const newStatus = !user.workerProfile.is_available;
                          const res = await fetch(`/api/workers/${user.workerProfile.id}/availability`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ is_available: newStatus })
                          });
                          if (res.ok) {
                            // Update local state - this is a bit hacky but works for demo
                            window.location.reload();
                          }
                        }}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                          user.workerProfile?.is_available ? "bg-emerald-600" : "bg-zinc-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          user.workerProfile?.is_available ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
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

          {/* Document Management for Workers */}
          {user.role === 'worker' && (
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900">Verification Docs</h3>
                <button 
                  onClick={() => updateDocuments([...documents, `https://picsum.photos/seed/doc-${Math.random()}/400/600`])}
                  disabled={updatingDocuments}
                  className="text-emerald-600 p-1 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 group">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-zinc-600">ID_Document_{i+1}.pdf</span>
                    </div>
                    <button 
                      onClick={() => updateDocuments(documents.filter((_, idx) => idx !== i))}
                      className="text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div className="py-6 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                    <p className="text-xs text-zinc-400">No documents uploaded.</p>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 mt-4 italic">Upload your ID and certificates for verification.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {reviewingJob && (
          <ReviewModal 
            isOpen={!!reviewingJob}
            onClose={() => setReviewingJob(null)}
            job={reviewingJob}
            onSubmit={submitReview}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'categories' | 'transactions' | 'analytics'>('overview');
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'Hammer' });
  const [verifyingUser, setVerifyingUser] = useState<any>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes, catsRes, transRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/jobs'),
        fetch('/api/categories'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/analytics')
      ]);
      
      const [statsData, usersData, jobsData, catsData, transData, analyticsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        jobsRes.json(),
        catsRes.json(),
        transRes.json(),
        analyticsRes.json()
      ]);

      setStats(statsData);
      setUsers(usersData);
      setJobs(jobsData);
      setCategories(catsData);
      setTransactions(transData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setVerifyStatus = async (workerId: number, status: boolean) => {
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_verified: status })
      });
      if (res.ok) fetchAdminData();
    } catch (err) { console.error(err); }
  };

  const toggleSuspend = async (userId: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_suspended: !currentStatus })
      });
      if (res.ok) fetchAdminData();
    } catch (err) { console.error(err); }
  };

  const addCategory = async () => {
    if (!newCategory.name) return;
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      if (res.ok) {
        setNewCategory({ name: '', icon: 'Hammer' });
        fetchAdminData();
      }
    } catch (err) { console.error(err); }
  };

  const deleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAdminData();
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'users', label: 'Users & Workers', icon: UserIcon },
    { id: 'categories', label: 'Categories', icon: Hammer },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Admin Control Center</h1>
          <p className="text-zinc-500">Real-time platform monitoring and management.</p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-2xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
                <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
              </div>
              <div className="divide-y divide-zinc-100">
                {users.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden">
                        {u.profile_photo ? (
                          <img src={u.profile_photo} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <UserIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      u.role === 'worker' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {u.role}
                    </span>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden">
                          {u.profile_photo ? (
                            <img src={u.profile_photo} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{u.name}</p>
                          <p className="text-xs text-zinc-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        u.role === 'worker' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.is_suspended ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                          <AlertTriangle className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.role === 'worker' && (
                          <button 
                            onClick={() => setVerifyingUser(u)}
                            className={cn(
                              "p-2 rounded-xl transition-all",
                              u.is_verified ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                            )}
                            title="Verify Documents"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => toggleSuspend(u.id, !!u.is_suspended)}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            u.is_suspended ? "bg-red-50 text-red-600" : "bg-zinc-100 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                          )}
                          title={u.is_suspended ? "Unsuspend" : "Suspend"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'categories' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm h-fit">
            <h3 className="font-bold text-zinc-900 mb-4">Add New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Category Name</label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. Landscaping"
                />
              </div>
              <button 
                onClick={addCategory}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
              >
                Create Category
              </button>
            </div>
          </div>
          <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900">Existing Categories</h3>
            </div>
            <div className="divide-y divide-zinc-100">
              {categories.map(cat => (
                <div key={cat.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-zinc-900">{cat.name}</p>
                  </div>
                  <button 
                    onClick={() => deleteCategory(cat.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'transactions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-zinc-600">{t.transaction_id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">{t.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{t.worker_name}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">KES {t.amount}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{new Date(t.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'analytics' && analytics && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-6">Job Volume (Last 7 Days)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.jobsByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      cursor={{fill: '#f9fafb'}}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-6">Revenue Trend (KES)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.revenueByDay}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verification Modal */}
      <AnimatePresence>
        {verifyingUser && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setVerifyingUser(null)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Verify Worker</h2>
                  <button onClick={() => setVerifyingUser(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <UserIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-zinc-900">{verifyingUser.name}</p>
                      <p className="text-sm text-zinc-500">{verifyingUser.category} • {verifyingUser.email}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-widest">Submitted Documents</h3>
                    <div className="space-y-3">
                      {verifyingUser.documents ? JSON.parse(verifyingUser.documents).map((doc: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:border-emerald-500 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                              <Camera className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-zinc-700">Document_{i+1}.jpg</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-emerald-600" />
                        </div>
                      )) : (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-3xl">
                          <p className="text-sm text-zinc-400">No documents submitted yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setVerifyStatus(verifyingUser.worker_id, true);
                        setVerifyingUser(null);
                      }}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                    >
                      Approve & Verify
                    </button>
                    <button 
                      onClick={() => {
                        setVerifyStatus(verifyingUser.worker_id, false);
                        setVerifyingUser(null);
                      }}
                      className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      socket.emit('join', parsedUser.role === 'worker' ? `worker_${parsedUser.workerProfile?.id}` : `user_${parsedUser.id}`);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    socket.on('job_update', (data) => {
      toast.success(`Job status updated to ${data.status.replace('_', ' ')}`);
    });

    socket.on('new_job', (data) => {
      if (user.role === 'worker') {
        toast.info(`New job request: ${data.service_type}`, {
          description: 'Check your dashboard to accept.',
          duration: 10000,
        });
      }
    });

    return () => {
      socket.off('job_update');
      socket.off('new_job');
    };
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('handson_user', JSON.stringify(userData));
    socket.emit('join', userData.role === 'worker' ? `worker_${userData.workerProfile?.id}` : `user_${userData.id}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('handson_user');
  };

  if (loading) return null;

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)} />
            <Route path="/dashboard" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard user={user} />) : <Navigate to="/login" />} />
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
