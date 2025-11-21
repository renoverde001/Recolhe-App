import React, { useState } from 'react';
import { Leaf, ArrowRight, User, Lock, Mail, CheckCircle, Recycle, Truck, Home, Globe, ChevronLeft, Sun, Moon } from 'lucide-react';
import { UserRole, Language, User as UserType } from '../types';
import { translations } from '../utils/translations';
import { auth } from '../services/api';

interface LoginProps {
  onLogin: (user: UserType, token?: string) => void;
  initialLanguage?: Language;
  initialRole?: UserRole;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, initialLanguage, initialRole, isDarkMode, toggleTheme }) => {
  const [language, setLanguage] = useState<Language | null>(initialLanguage || null);
  const [role, setRole] = useState<UserRole | null>(initialRole || null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@recolhe.plus');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const t = language ? translations[language] : translations['en'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering && password !== confirmPassword) {
      alert(t.auth.passMismatch);
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isRegistering) {
        response = await auth.register(name, email, password, role || 'user', language || 'en');
        alert(t.auth.accountCreated);
      } else {
        response = await auth.login(email, password);
      }
      onLogin(response.user, response.token);

    } catch (error) {
      console.warn("Backend connection failed, falling back to Demo Mode:", error);
      setTimeout(() => {
        const mockUser: UserType = {
          id: Date.now().toString(),
          name: name || (role === UserRole.COLLECTOR ? 'John Collector' : 'Maria Silva'),
          email: email,
          role: role || UserRole.USER,
          ecoCoins: isRegistering ? 0 : 1250,
          language: language || 'en'
        };
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('user', JSON.stringify(mockUser));

        if (isRegistering) {
          alert(`${t.auth.accountCreated} (Demo Mode)`);
        }
        onLogin(mockUser, 'mock-token');
        setLoading(false);
      }, 800);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setPassword('');
    setConfirmPassword('');
    if (!isRegistering) {
      setEmail(''); 
    } else {
      setEmail('demo@recolhe.plus');
    }
  };

  // Theme Toggle Button Component
  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className="absolute top-8 right-8 z-20 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );

  // Left Side Panel (Visual)
  const SidePanel = () => (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-800 to-emerald-600 relative overflow-hidden p-12 flex-col justify-between text-white">
      <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <Recycle className="w-6 h-6 text-emerald-100" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Recolhe<span className="text-emerald-300">+</span></span>
        </div>
        <h2 className="text-5xl font-extrabold leading-tight mb-4">
          Turn Waste into <br/> <span className="text-emerald-200">Wealth</span>
        </h2>
        <p className="text-emerald-100 text-lg max-w-md">
          Join Bissau's smartest recycling network. Track waste, schedule pickups, and earn real rewards.
        </p>
      </div>

      <div className="relative z-10 flex gap-4 text-sm font-medium text-emerald-100/80">
        <span>© 2025 Renoverde</span>
        <span>•</span>
        <span>Privacy Policy</span>
      </div>
    </div>
  );

  // 1. Language Selection Screen
  if (!language) {
    return (
      <div className="min-h-screen flex">
        <SidePanel />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
          <ThemeToggle />
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Language</h1>
              <h1 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2">Choisir la langue</h1>
              <h1 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">Escolha o idioma</h1>
            </div>

            <div className="space-y-4">
              {[
                { code: 'en', label: 'English', flag: '🇺🇸' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'pt', label: 'Português', flag: '🇵🇹' }
              ].map((lang) => (
                <button 
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as Language)}
                  className="w-full p-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 flex items-center gap-4 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">{lang.label}</span>
                  <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Role Selection Screen
  if (!role) {
    return (
      <div className="min-h-screen flex">
        <SidePanel />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
          <ThemeToggle />
          <button 
            onClick={() => setLanguage(null)}
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            {t.common.back}
          </button>

          <div className="w-full max-w-lg animate-slide-up">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t.auth.welcomeTitle}</h1>
              <p className="text-slate-500 dark:text-slate-400">{t.auth.selectType}</p>
            </div>

            <div className="grid gap-6">
              <button 
                onClick={() => setRole(UserRole.USER)}
                className="group relative p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 text-left hover:shadow-xl hover:shadow-emerald-500/10 bg-white dark:bg-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.auth.roleUser}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t.auth.roleUserDesc}</p>
                  </div>
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-emerald-500" />
                </div>
              </button>

              <button 
                onClick={() => setRole(UserRole.COLLECTOR)}
                className="group relative p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 text-left hover:shadow-xl hover:shadow-blue-500/10 bg-white dark:bg-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/50 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Truck className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.auth.roleCollector}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{t.auth.roleCollectorDesc}</p>
                  </div>
                </div>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Login/Register Form
  const isCollector = role === UserRole.COLLECTOR;
  const accentColor = isCollector ? 'blue' : 'emerald';
  
  return (
    <div className="min-h-screen flex">
      <SidePanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
        <ThemeToggle />
        <button 
          onClick={() => setRole(null)}
          className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          {t.common.back}
        </button>

        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isCollector ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
              {isCollector ? (
                 <Truck className={`w-8 h-8 ${isCollector ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
              ) : (
                 <Recycle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {isRegistering ? t.auth.createAccount : t.auth.loginTitle}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
               {isCollector ? t.auth.collectorPortal : t.auth.userPortal}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="animate-slide-up">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.fullName}
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Jane Doe"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.email}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.auth.password}
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isRegistering && (
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.confirmPassword}
                </label>
                <div className="relative group">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-${accentColor}-500/20 hover:shadow-${accentColor}-500/40 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6
                ${isCollector ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? t.auth.createAccount : t.auth.signIn}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isRegistering ? t.auth.haveAccount : t.auth.noAccount}{' '}
            <button 
              onClick={toggleMode}
              className={`font-bold hover:underline transition-colors ${isCollector ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}
            >
              {isRegistering ? t.auth.signIn : t.auth.signUp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;