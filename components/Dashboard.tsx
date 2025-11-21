import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Coins, Weight, Calendar, TrendingUp, ArrowUpRight, Truck } from 'lucide-react';
import { Transaction, PickupRequest, UserRole, Language } from '../types';
import { translations } from '../utils/translations';

interface ChartDataPoint {
  name: string;
  plastic: number;
  paper: number;
  glass: number;
  metal: number;
  organic: number;
  'e-waste': number;
}

interface DashboardProps {
  userRole: UserRole;
  ecoCoins: number;
  transactions: Transaction[];
  nextPickup: PickupRequest | null;
  totalRecycled: number;
  chartData: ChartDataPoint[];
  language: Language;
}

const COLORS = {
  plastic: '#10b981', // emerald-500
  paper: '#f59e0b',   // amber-500
  glass: '#3b82f6',   // blue-500
  metal: '#64748b',   // slate-500
  organic: '#84cc16', // lime-500
  'e-waste': '#8b5cf6' // violet-500
};

const Dashboard: React.FC<DashboardProps> = ({ userRole, ecoCoins, transactions, nextPickup, totalRecycled, chartData, language }) => {
  const isCollector = userRole === UserRole.COLLECTOR;
  const t = translations[language];

  // Calculation: 485kg approx 7 trees => ~69kg per tree
  const treesSaved = Math.floor(totalRecycled / 69);

  const StatsCard = ({ title, value, subValue, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110 duration-500`}>
        <Icon className={`w-32 h-32 ${colorClass}`} />
      </div>
      <div className="flex items-center gap-4 mb-3 relative z-10">
        <div className={`p-3 rounded-2xl ${bgClass} shadow-sm`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <h3 className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
          {title}
        </h3>
      </div>
      <p className="text-4xl font-bold text-slate-900 dark:text-white relative z-10 tracking-tight">{value}</p>
      <div className="mt-4 relative z-10">
        {subValue}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title={isCollector ? t.dashboard.earnings : t.dashboard.balance}
          value={ecoCoins.toLocaleString()}
          icon={Coins}
          colorClass="text-amber-500"
          bgClass="bg-amber-50 dark:bg-amber-900/20"
          subValue={
            <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full w-fit">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>{ecoCoins > 0 ? `+120 ${t.dashboard.thisWeek}` : t.dashboard.startEarning}</span>
            </div>
          }
        />

        <StatsCard 
          title={isCollector ? t.dashboard.totalCollected : t.dashboard.totalRecycled}
          value={<>{totalRecycled} <span className="text-xl font-normal text-slate-400">kg</span></>}
          icon={Weight}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50 dark:bg-emerald-900/20"
          subValue={
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {totalRecycled > 0 ? t.dashboard.savedTrees.replace('{n}', String(treesSaved)) : t.dashboard.noImpact}
            </div>
          }
        />

        <StatsCard 
          title={isCollector ? t.dashboard.activeRoute : t.dashboard.nextPickup}
          value={nextPickup ? (
            <span className="text-2xl">
              {new Date(nextPickup.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          ) : (
            <span className="text-2xl text-slate-400">{isCollector ? "Inactive" : "None"}</span>
          )}
          icon={isCollector ? Truck : Calendar}
          colorClass="text-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
          subValue={
            nextPickup ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                   {new Date(nextPickup.scheduledAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                  {nextPickup.status.replace('_', ' ')}
                </span>
              </div>
            ) : (
              <button className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center">
                 {isCollector ? t.dashboard.findRoutes : t.dashboard.scheduleOne} <ArrowUpRight className="w-4 h-4 ml-1"/>
               </button>
            )
          }
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isCollector ? t.dashboard.volume : t.dashboard.activity}
             </h3>
             <div className="flex gap-2">
                {Object.entries(COLORS).map(([key, color]) => (
                  <div key={key} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 capitalize">{t.pickup.items[key as keyof typeof t.pickup.items] || key}</span>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700/50" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 16px'
                  }}
                />
                <Bar dataKey="plastic" stackId="a" fill={COLORS.plastic} radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="paper" stackId="a" fill={COLORS.paper} radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="glass" stackId="a" fill={COLORS.glass} radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="metal" stackId="a" fill={COLORS.metal} radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="organic" stackId="a" fill={COLORS.organic} radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="e-waste" stackId="a" fill={COLORS['e-waste']} radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.dashboard.recentHistory}</h3>
            <button className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-bold">{t.dashboard.viewAll}</button>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 no-scrollbar">
            {transactions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <Calendar className="w-12 h-12 text-slate-400 mb-2" />
                  <p className="text-slate-500 text-sm">{t.dashboard.noTrans}</p>
               </div>
            ) : (
              transactions.slice(0, 6).map((tx) => (
                <div key={tx.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'earned' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                      {tx.type === 'earned' ? <ArrowUpRight className="w-5 h-5" /> : <Weight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{tx.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === 'earned' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-300'}`}>
                    {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;