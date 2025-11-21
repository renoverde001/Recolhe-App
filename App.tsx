import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PickupForm from './components/PickupForm';
import ChatAssistant from './components/ChatAssistant';
import Rewards from './components/Rewards';
import SmartBin from './components/SmartBin';
import MapView from './components/MapView';
import { View, User, UserRole, Transaction, PickupRequest, Language } from './types';
import { translations } from './utils/translations';
import { auth, pickups as pickupApi } from './services/api';
import { WifiOff } from 'lucide-react';

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 50, type: 'earned', description: 'Plastic Recycling (5kg)', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
  { id: '2', amount: 100, type: 'spent', description: 'Market Voucher', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
  { id: '3', amount: 30, type: 'earned', description: 'Glass Recycling (3kg)', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() },
];

const MOCK_PICKUPS: PickupRequest[] = [
  {
    id: 'mock-1',
    status: 'assigned',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    location: 'Av. Amílcar Cabral, Bissau',
    items: [{ type: 'plastic', quantity: 2 }, { type: 'paper', quantity: 1 }]
  },
  {
    id: 'mock-2',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    location: 'Av. Amílcar Cabral, Bissau',
    items: [{ type: 'glass', quantity: 3 }]
  }
];

const MOCK_CHART_DATA = [
  { name: 'Mon', plastic: 4, paper: 2, glass: 1, metal: 0, organic: 1, 'e-waste': 0 },
  { name: 'Tue', plastic: 3, paper: 5, glass: 2, metal: 1, organic: 2, 'e-waste': 0 },
  { name: 'Wed', plastic: 2, paper: 2, glass: 1, metal: 0, organic: 3, 'e-waste': 0 },
  { name: 'Thu', plastic: 6, paper: 3, glass: 3, metal: 0, organic: 2, 'e-waste': 1 },
  { name: 'Fri', plastic: 5, paper: 4, glass: 2, metal: 1, organic: 2, 'e-waste': 0 },
  { name: 'Sat', plastic: 8, paper: 6, glass: 4, metal: 2, organic: 5, 'e-waste': 0 },
  { name: 'Sun', plastic: 3, paper: 2, glass: 1, metal: 0, organic: 2, 'e-waste': 0 },
];

const EMPTY_CHART_DATA = [
  { name: 'Mon', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
  { name: 'Tue', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
  { name: 'Wed', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
  { name: 'Thu', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
  { name: 'Fri', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
  { name: 'Sat', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
  { name: 'Sun', plastic: 0, paper: 0, glass: 0, metal: 0, organic: 0, 'e-waste': 0 },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isOffline, setIsOffline] = useState(false);
  
  // New state for dashboard stats
  const [totalRecycled, setTotalRecycled] = useState(485);
  const [chartData, setChartData] = useState(MOCK_CHART_DATA);

  // State for login flow config
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);
  const [languageSelected, setLanguageSelected] = useState(false);

  const t = translations[language];

  // Check for persisted user session on mount
  useEffect(() => {
    const savedUser = auth.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setLanguage(savedUser.language as Language || 'en');
      setLanguageSelected(true);
    }
  }, []);

  // Fetch pickups when user is logged in
  useEffect(() => {
    if (user) {
      pickupApi.list()
        .then(data => {
          setPickups(data);
          setIsOffline(false);
        })
        .catch(err => {
          console.log("Backend unreachable, using local mock data", err);
          setPickups(MOCK_PICKUPS);
          setIsOffline(true);
        });
    }
  }, [user]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (loggedInUser: User, token?: string) => {
    setUser(loggedInUser);
    // Type assertion for language if coming from backend string
    if (loggedInUser.language) {
        setLanguage(loggedInUser.language as Language);
    }
    setLanguageSelected(true);
    setTargetRole(null);

    // If it's a fresh account (0 coins), clear the mock data
    if (loggedInUser.ecoCoins === 0) {
      setTransactions([]);
      setTotalRecycled(0);
      setChartData(EMPTY_CHART_DATA);
    } else {
      // Demo/Existing user
      setTransactions(MOCK_TRANSACTIONS);
      setTotalRecycled(485);
      setChartData(MOCK_CHART_DATA);
    }
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setCurrentView(View.LOGIN);
    setIsOffline(false);
  };

  const handleRoleToggle = () => {
    if (!user) return;
    const newRole = user.role === UserRole.USER ? UserRole.COLLECTOR : UserRole.USER;
    
    auth.logout();
    setTargetRole(newRole);
    setUser(null);
    setCurrentView(View.LOGIN);
    setIsOffline(false);
  };

  const handlePickupSubmit = async (requestData: Partial<PickupRequest>) => {
    try {
      const newPickup = await pickupApi.create({
        items: requestData.items || [],
        scheduledAt: requestData.scheduledAt || new Date().toISOString(),
        location: requestData.location || '',
        notes: requestData.notes,
      });
      
      setPickups(prev => [newPickup, ...prev]);
      alert(t.pickup.success);
      setCurrentView(View.DASHBOARD);
    } catch (error) {
      console.error("Failed to create pickup via API", error);
      // Fallback to local state for demo
      const fallbackPickup: PickupRequest = {
          id: Date.now().toString(),
          status: 'requested',
          scheduledAt: requestData.scheduledAt || new Date().toISOString(),
          items: requestData.items || [],
          location: requestData.location || '',
          notes: requestData.notes,
      };
      setPickups(prev => [fallbackPickup, ...prev]);
      setIsOffline(true);
      alert(`${t.pickup.success} (Offline Mode)`);
      setCurrentView(View.DASHBOARD);
    }
  };

  const handleRedemption = (amount: number, description: string) => {
    if (!user) return;

    // Update user balance locally
    setUser(prev => prev ? { ...prev, ecoCoins: prev.ecoCoins - amount } : null);

    // Add transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: amount,
      type: 'spent',
      description: description,
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
  };

  // Get next scheduled pickup
  const nextPickup = pickups.find(p => p.status === 'requested' || p.status === 'assigned') || null;

  if (!user) {
    return (
      <Login 
        onLogin={handleLogin} 
        initialLanguage={languageSelected ? language : undefined}
        initialRole={targetRole || undefined}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <Layout 
      currentView={currentView} 
      onNavigate={setCurrentView} 
      onLogout={handleLogout}
      user={user}
      isDarkMode={isDarkMode}
      toggleTheme={toggleTheme}
      onToggleRole={handleRoleToggle}
      language={language}
    >
      {isOffline && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
          <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-800 dark:text-amber-200 font-medium">
            Offline Mode: Backend unreachable. Using mock data.
          </span>
        </div>
      )}

      {currentView === View.DASHBOARD && (
        <Dashboard 
          userRole={user.role}
          ecoCoins={user.ecoCoins} 
          transactions={transactions}
          nextPickup={nextPickup}
          totalRecycled={totalRecycled}
          chartData={chartData}
          language={language}
        />
      )}
      
      {currentView === View.PICKUP && (
        <PickupForm 
          onSubmit={handlePickupSubmit} 
          onCancel={() => setCurrentView(View.DASHBOARD)}
          language={language}
        />
      )}

      {currentView === View.REWARDS && (
        <Rewards 
          balance={user.ecoCoins}
          onRedeem={handleRedemption}
          language={language}
        />
      )}

      {currentView === View.ASSISTANT && (
        <ChatAssistant language={language} />
      )}
      
      {currentView === View.SMART_BIN && (
        <SmartBin language={language} />
      )}
      
      {currentView === View.MAP && (
        <MapView role={user.role} language={language} isDarkMode={isDarkMode} />
      )}

      {currentView === View.HISTORY && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
           <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">{t.history.header}</h2>
           {transactions.length > 0 ? (
             <div className="divide-y divide-slate-100 dark:divide-slate-700">
               {transactions.map(t => (
                 <div key={t.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{t.description}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold ${t.type === 'earned' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-300'}`}>
                      {t.type === 'earned' ? '+' : '-'}{t.amount}
                    </span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8">
               <div className="bg-slate-50 dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors">
                 <span className="text-2xl">📜</span>
               </div>
               <p className="text-slate-500 dark:text-slate-400">{t.history.empty}</p>
             </div>
           )}
        </div>
      )}
    </Layout>
  );
};

export default App;
