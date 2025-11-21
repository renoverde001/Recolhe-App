
import React, { useState } from 'react';
import { Trash2, Wifi, Battery, RefreshCw, CheckCircle, AlertTriangle, Zap, CreditCard, Calendar, Lock, Unlock, Wind, Settings } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface SmartBinProps {
    language: Language;
}

type SubscriptionPlan = 'weekly' | 'monthly';
type PaymentStatus = 'active' | 'overdue';

const SmartBin: React.FC<SmartBinProps> = ({ language }) => {
  const [binId, setBinId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  // Mock Data state
  const [stats, setStats] = useState({
    fillLevel: 0,
    battery: 0,
    temperature: 0,
    lastSync: ''
  });

  // Subscription State
  const [subscription, setSubscription] = useState<{
    plan: SubscriptionPlan;
    amount: number;
    dueDate: string;
    status: PaymentStatus;
  }>({
    plan: 'monthly',
    amount: 5000,
    dueDate: '',
    status: 'active'
  });

  // Controls State
  const [controls, setControls] = useState({
    isLocked: true,
    isOdorControlOn: false,
    isMaintenanceMode: false
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!binId.trim()) return;
    
    setLoading(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setLoading(false);
      setIsConnected(true);
      // Set mock initial stats
      setStats({
        fillLevel: 78,
        battery: 92,
        temperature: 24,
        lastSync: 'Just now'
      });
      
      // Set mock subscription
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 5); // Due in 5 days
      setSubscription({
        plan: 'monthly',
        amount: 5000, // XOF
        dueDate: nextMonth.toLocaleDateString(),
        status: 'active'
      });
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setBinId('');
    setStats({ fillLevel: 0, battery: 0, temperature: 0, lastSync: '' });
  };

  const togglePlan = () => {
    setSubscription(prev => ({
      ...prev,
      plan: prev.plan === 'monthly' ? 'weekly' : 'monthly',
      amount: prev.plan === 'monthly' ? 1500 : 5000
    }));
  };

  const handlePayBill = () => {
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + 1);
        setSubscription(prev => ({
            ...prev,
            status: 'active',
            dueDate: nextDate.toLocaleDateString()
        }));
        alert("Payment processed successfully!");
    }, 1000);
  };

  const toggleControl = (key: keyof typeof controls) => {
      setControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!isConnected ? (
        /* Connection Screen */
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center transition-colors">
           <div className="bg-slate-100 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wifi className="w-10 h-10 text-slate-400 dark:text-slate-300" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.smartBin.connectTitle}</h2>
           <p className="text-slate-500 dark:text-slate-400 mb-8">
             {t.smartBin.connectDesc}
           </p>
           
           <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={binId}
                  onChange={(e) => setBinId(e.target.value)}
                  placeholder={t.smartBin.deviceId}
                  className="w-full text-center uppercase tracking-widest font-mono px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !binId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? t.common.loading : t.smartBin.linkDevice}
              </button>
           </form>
        </div>
      ) : (
        /* Dashboard Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Header & Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                    <Trash2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">{binId}</h2>
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        {t.smartBin.online}
                    </div>
                    </div>
                </div>
                <button 
                onClick={handleDisconnect}
                className="text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
                >
                {t.smartBin.disconnect}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Fill Level */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-4">{t.smartBin.fillLevel}</h3>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * stats.fillLevel) / 100} className={`${stats.fillLevel > 75 ? 'text-red-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-3xl font-bold text-slate-900 dark:text-white">{stats.fillLevel}%</span>
                    </div>
                    <div className="mt-4">
                    {stats.fillLevel > 75 ? (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full text-sm font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            {t.smartBin.pickupRec}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                            {t.smartBin.capacityOk}
                        </div>
                    )}
                    </div>
                </div>

                {/* Battery */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{t.smartBin.battery}</h3>
                    <Battery className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{stats.battery}%</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.battery}%` }}></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{t.smartBin.lastCharge}</p>
                    </div>
                </div>

                {/* Environment */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 font-medium">{t.smartBin.temp}</h3>
                    <Zap className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                    <p className="text-4xl font-bold text-slate-900 dark:text-white mb-1">{stats.temperature}°C</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.smartBin.range}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-4">
                    <RefreshCw className="w-4 h-4" />
                    {t.smartBin.sync} {stats.lastSync}
                    </div>
                </div>
            </div>
            
            {/* Action Banner */}
            {stats.fillLevel > 70 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white flex items-center justify-between shadow-lg">
                    <div>
                    <h3 className="font-bold text-lg">{t.smartBin.almostFull}</h3>
                    <p className="text-orange-100 opacity-90">{t.smartBin.scheduleNow}</p>
                    </div>
                    <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-colors">
                    {t.nav.pickup}
                    </button>
                </div>
            )}
          </div>

          {/* Right Column: Subscription & Controls */}
          <div className="lg:col-span-1 space-y-6">
              
              {/* Subscription Card */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{t.smartBin.subscription}</h3>
                  </div>

                  <div className="space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
                          <span className="text-slate-500 dark:text-slate-400 text-sm">{t.smartBin.plan}</span>
                          <button onClick={togglePlan} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                             {subscription.plan === 'monthly' ? t.smartBin.monthly : t.smartBin.weekly}
                          </button>
                      </div>

                      <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400 text-sm">{t.smartBin.due}</span>
                          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-medium">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {subscription.dueDate}
                          </div>
                      </div>

                      <div className="flex justify-between items-center">
                           <span className="text-slate-500 dark:text-slate-400 text-sm">{t.smartBin.status}</span>
                           <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                               subscription.status === 'active' 
                               ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                               : 'bg-red-100 text-red-700'
                           }`}>
                               {subscription.status === 'active' ? t.smartBin.active : t.smartBin.overdue}
                           </span>
                      </div>

                      <div className="pt-2">
                          <div className="flex items-end gap-1 mb-4">
                              <span className="text-3xl font-bold text-slate-900 dark:text-white">{subscription.amount.toLocaleString()}</span>
                              <span className="text-sm text-slate-500 dark:text-slate-400 mb-1.5">XOF</span>
                          </div>
                          <button 
                            onClick={handlePayBill}
                            disabled={subscription.status === 'active'}
                            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                subscription.status === 'active'
                                ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none'
                            }`}
                          >
                             {loading ? t.common.loading : (
                                 subscription.status === 'active' ? 'Paid' : t.smartBin.payNow
                             )}
                          </button>
                      </div>
                  </div>
              </div>

              {/* Smart Controls */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{t.smartBin.controls}</h3>
                  </div>

                  <div className="space-y-3">
                      {/* Lid Lock Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                              {controls.isLocked ? <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" /> : <Unlock className="w-5 h-5 text-slate-400" />}
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.smartBin.lidLock}</span>
                          </div>
                          <button 
                            onClick={() => toggleControl('isLocked')}
                            className={`relative w-11 h-6 rounded-full transition-colors ${controls.isLocked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${controls.isLocked ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>

                      {/* Odor Control Toggle */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                              <Wind className={`w-5 h-5 ${controls.isOdorControlOn ? 'text-blue-500 animate-pulse' : 'text-slate-400'}`} />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.smartBin.odorControl}</span>
                          </div>
                          <button 
                            onClick={() => toggleControl('isOdorControlOn')}
                            className={`relative w-11 h-6 rounded-full transition-colors ${controls.isOdorControlOn ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${controls.isOdorControlOn ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>

                       {/* Maintenance Toggle */}
                       <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                              <RefreshCw className="w-5 h-5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.smartBin.maintenance}</span>
                          </div>
                          <button 
                            onClick={() => toggleControl('isMaintenanceMode')}
                            className={`relative w-11 h-6 rounded-full transition-colors ${controls.isMaintenanceMode ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                              <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${controls.isMaintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartBin;
