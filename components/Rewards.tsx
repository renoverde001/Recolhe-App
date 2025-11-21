
import React, { useState } from 'react';
import { Smartphone, CreditCard, ShoppingBag, CheckCircle, AlertCircle, Coins } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface RewardsProps {
  balance: number;
  onRedeem: (amount: number, description: string) => void;
  language: Language;
}

type RewardType = 'airtime' | 'cash' | 'voucher';

const EXCHANGE_RATE = 10; // 1 EcoCoin = 10 XOF

const Rewards: React.FC<RewardsProps> = ({ balance, onRedeem, language }) => {
  const [activeTab, setActiveTab] = useState<RewardType>('airtime');
  const [amount, setAmount] = useState<number>(500);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState('Orange');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = translations[language];

  const costInCoins = Math.ceil(amount / EXCHANGE_RATE);
  const canAfford = balance >= costInCoins;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let description = '';
      switch (activeTab) {
        case 'airtime':
          description = `${t.rewards.airtime} (${amount} XOF) - ${provider}`;
          break;
        case 'cash':
          description = `${t.rewards.mobileMoney} (${amount} XOF) - ${provider}`;
          break;
        case 'voucher':
          description = `${t.rewards.giftCard} (${amount} XOF)`;
          break;
      }
      
      onRedeem(costInCoins, description);
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Balance Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Coins className="w-32 h-32" />
          </div>
          <p className="text-yellow-100 font-medium mb-1">{t.rewards.availableBalance}</p>
          <h2 className="text-4xl font-bold mb-2">{balance.toLocaleString()}</h2>
          <p className="text-sm opacity-90">EcoCoins</p>
          
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span>{t.rewards.exchangeRate}</span>
              <span className="font-bold">1 Coin = {EXCHANGE_RATE} XOF</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
               <span>{t.rewards.buyingPower}</span>
               <span className="font-bold">{(balance * EXCHANGE_RATE).toLocaleString()} XOF</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t.rewards.howItWorks}</h3>
          <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded text-emerald-600 dark:text-emerald-400 h-fit">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>{t.rewards.step1}</span>
            </li>
            <li className="flex gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded text-emerald-600 dark:text-emerald-400 h-fit">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>{t.rewards.step2}</span>
            </li>
            <li className="flex gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded text-emerald-600 dark:text-emerald-400 h-fit">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span>{t.rewards.step3}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Redemption Form */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8 transition-colors">
        {success ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.rewards.successTitle}</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              {t.rewards.successDesc.replace('{n}', String(costInCoins))}
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-8 px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {t.rewards.anotherTrans}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => setActiveTab('airtime')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  activeTab === 'airtime'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Smartphone className={`w-8 h-8 ${activeTab === 'airtime' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="font-medium">{t.rewards.airtime}</span>
              </button>
              
              <button
                onClick={() => setActiveTab('cash')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  activeTab === 'cash'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                <CreditCard className={`w-8 h-8 ${activeTab === 'cash' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="font-medium">{t.rewards.mobileMoney}</span>
              </button>

              <button
                onClick={() => setActiveTab('voucher')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                  activeTab === 'voucher'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ShoppingBag className={`w-8 h-8 ${activeTab === 'voucher' ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="font-medium">{t.rewards.giftCard}</span>
              </button>
            </div>

            <form onSubmit={handleRedeem} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.rewards.amount}
                </label>
                <select 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                >
                  <option value={200}>200 XOF (20 Coins)</option>
                  <option value={500}>500 XOF (50 Coins)</option>
                  <option value={1000}>1,000 XOF (100 Coins)</option>
                  <option value={2000}>2,000 XOF (200 Coins)</option>
                  <option value={5000}>5,000 XOF (500 Coins)</option>
                  <option value={10000}>10,000 XOF (1,000 Coins)</option>
                </select>
              </div>

              {(activeTab === 'airtime' || activeTab === 'cash') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t.rewards.provider}
                    </label>
                    <div className="flex flex-wrap gap-4">
                       {['Orange', 'Telecel'].map(p => (
                         <label key={p} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="provider" 
                              value={p}
                              checked={provider === p}
                              onChange={() => setProvider(p)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-slate-700 dark:text-slate-300">{p}</span>
                         </label>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t.rewards.phone}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+221 XX XXX XX XX"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'voucher' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.rewards.storeChain}
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-colors">
                    <option>Comercial Santy</option>
                    <option>Supermercado Darling</option>
                    <option>Ghada Supermercado</option>
                    <option>Chapa de Bissau Supermercado</option>
                    <option>MiniMercado Alvalade</option>
                    <option>Spar Supermercado</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">{t.rewards.codeSent}</p>
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{t.rewards.cost}</span>
                <span className={`text-xl font-bold ${canAfford ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {costInCoins}
                </span>
              </div>

              {!canAfford && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.rewards.insufficient}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !canAfford}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all transform active:scale-95"
              >
                {loading ? t.common.loading : t.rewards.confirm}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Rewards;
