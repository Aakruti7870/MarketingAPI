import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar, PublicFooter } from '../components/PublicNav';
import { Button, Badge } from '../components/ui';
import { useAuth, ADMIN_CREDENTIALS } from '../context/AuthContext';
import {
  Bot,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  Building2,
  Phone,
  CheckCircle2,
  User,
  Eye,
  EyeOff,
  Activity,
  Store,
  GraduationCap,
  KeyRound,
  Check
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [loginFeedback, setLoginFeedback] = useState(null);

  const demoAccounts = [
    { label: 'Healthcare Clinic', email: 'dr.mehta@metrohealth.in', role: 'Hospital OPD Admin', icon: Activity },
    { label: 'Academy & Schools', email: 'admissions@eduprep.edu', role: 'Admissions Director', icon: GraduationCap },
    { label: 'B2B Wholesale & RMC', email: 'orders@buildmatrix.in', role: 'Fleet & RFQ Manager', icon: Building2 },
    { label: 'Retail & Salons', email: 'manager@urbanretail.in', role: 'Store Growth Lead', icon: Store },
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoginFeedback(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Check if Super Admin credentials
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
      try {
        await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
      } catch (err) {
        console.warn('Backend admin login call error:', err);
      }
      login(cleanEmail, password);
      setLoginFeedback({
        type: 'success',
        text: 'Super Admin Authenticated! Everything Free Access (Unlimited Credits) Activated.',
      });
      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard');
      }, 500);
      return;
    }

    // Standard login
    login(cleanEmail, password);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 450);
  };

  const handleAdminQuickFill = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setSelectedDemo('Super Admin');
    setLoading(true);
    setLoginFeedback({
      type: 'success',
      text: 'Super Admin credentials loaded! Authenticating Everything Free Access...',
    });
    
    setTimeout(() => {
      login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  const handleDemoSelect = (account) => {
    setEmail(account.email);
    setPassword('••••••••••••');
    setSelectedDemo(account.label);
    setLoading(true);
    setTimeout(() => {
      login(account.email, 'demo-pass');
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/50 text-slate-900 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
        {/* Soft Ambient Refractive Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          {/* Glass Card */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
            
            {/* Header with Glossy Icon */}
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                <Bot className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">
                Log in to your autonomous marketing and agentic bot control room.
              </p>
            </div>

            {/* Super Admin Instant Access Card */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl shadow-indigo-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs shadow-md">
                    ⚡
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">Super Admin Access</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-semibold">
                  Everything Free (∞)
                </span>
              </div>
              
              <div className="text-[11px] text-slate-300 mb-3 space-y-0.5 font-mono">
                <div>Email: <span className="text-amber-300 font-semibold">krushnabade54@gmail.com</span></div>
                <div>Pass: <span className="text-slate-400">Krushna@1208</span></div>
              </div>

              <button
                type="button"
                onClick={handleAdminQuickFill}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>1-Click Sign In as Admin</span>
              </button>
            </div>

            {loginFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loginFeedback.text}</span>
              </div>
            )}

            {/* Quick Demo Access Pills */}
            <div className="mb-6 p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Instant Demo Access
                </span>
                <span className="text-[10px] font-bold text-indigo-600">1-Click Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.label}
                      type="button"
                      onClick={() => handleDemoSelect(account)}
                      className="p-2.5 rounded-xl bg-white/90 hover:bg-white border border-white/90 shadow-sm text-left transition flex items-center gap-2 cursor-pointer hover:border-indigo-300 hover:shadow-md group"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-slate-800 truncate">{account.label}</div>
                        <div className="text-[9px] text-slate-500 truncate">{account.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">or sign in with email</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email / Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Control Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-600 font-medium">
              Don't have an enterprise workspace?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
                Create new workspace
              </Link>
            </div>

            {/* Trust badge */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SOC2 Type II & Meta WhatsApp Verified Infrastructure</span>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'healthcare',
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-sky-50/50 text-slate-900 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
        {/* Ambient Refraction */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl relative z-10">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(99,102,241,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
            
            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Create Your Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium">
                Get started with autonomous multi-channel marketing and AI conversational agents.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Business Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Metro Care Clinic"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry Vertical</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                  >
                    <option value="healthcare">Hospitals & Clinics</option>
                    <option value="education">Schools & Coaching</option>
                    <option value="retail">Retail Stores & Salons</option>
                    <option value="suppliers">B2B Wholesale Suppliers</option>
                    <option value="rmc">RMC Concrete & Materials</option>
                    <option value="property">Real Estate & Developers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Rajesh Mehta"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="rajesh@metrocare.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 44556"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Create Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Provisioning workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Autonomous Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-slate-600 font-medium">
              Already have an active account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
