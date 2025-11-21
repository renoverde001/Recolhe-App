import React, { useState } from 'react';
import { Truck, Plus, Minus, MapPin, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { PickupRequest, WasteItem, Language } from '../types';
import { translations } from '../utils/translations';

interface PickupFormProps {
  onSubmit: (request: Partial<PickupRequest>) => void;
  onCancel: () => void;
  language: Language;
}

const PRICE_PER_SACK = 500; // XOF

const PickupForm: React.FC<PickupFormProps> = ({ onSubmit, onCancel, language }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ [key: string]: number }>({
    plastic: 0,
    paper: 0,
    glass: 0,
    metal: 0,
    organic: 0,
    'e-waste': 0,
  });
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Home (123 Green Street, Apt 4B)');
  const [notes, setNotes] = useState('');
  
  const t = translations[language];

  const handleIncrement = (type: string) => {
    setItems(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleDecrement = (type: string) => {
    setItems(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
  };

  // Cast to number[] to avoid issues if Object.values infers unknown[] in strict environments
  const totalSacks = (Object.values(items) as number[]).reduce((acc, curr) => acc + curr, 0);
  const totalCost = totalSacks * PRICE_PER_SACK;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const wasteItems: WasteItem[] = Object.entries(items)
      .filter(([_, qty]) => (qty as number) > 0)
      .map(([type, qty]) => ({
        type: type as WasteItem['type'],
        quantity: qty as number,
      }));

    if (wasteItems.length === 0) {
      alert(t.pickup.alertItem);
      setLoading(false);
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    setTimeout(() => {
      onSubmit({
        items: wasteItems,
        scheduledAt,
        location,
        notes,
        status: 'requested',
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 md:p-8 animate-fade-in transition-colors">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full">
          <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.pickup.title}</h2>
          <p className="text-slate-500 dark:text-slate-400">{t.pickup.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Waste Items */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{t.pickup.collectingQuestion}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(items).map(([type, qty]) => (
              <div key={type} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/50">
                <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                  {t.pickup.items[type as keyof typeof t.pickup.items] || type}
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => handleDecrement(type)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-semibold text-slate-900 dark:text-white">{qty}</span>
                  <button 
                    type="button"
                    onClick={() => handleIncrement(type)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Price Summary */}
          <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 flex items-center justify-between border border-emerald-100 dark:border-emerald-800/50">
             <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                <DollarSign className="w-5 h-5" />
                <span className="font-medium">{t.pickup.feePerSack}</span>
                <span>{PRICE_PER_SACK} XOF</span>
             </div>
             <div className="text-right">
                <span className="block text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wide">{t.pickup.totalFee}</span>
                <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{totalCost.toLocaleString()} XOF</span>
             </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.pickup.date}</label>
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.pickup.time}</label>
                <input 
                    type="time" 
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
            </div>
        </div>

        {/* Location */}
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.pickup.location}</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" 
                />
            </div>
        </div>

        {/* Notes */}
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.pickup.notes}</label>
            <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={t.pickup.notesPlaceholder}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            />
        </div>

        <div className="flex items-center gap-4 pt-4">
            <button 
                type="button" 
                onClick={onCancel}
                className="flex-1 px-6 py-3 text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
                {t.common.cancel}
            </button>
            <button 
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-all transform active:scale-95 flex justify-center items-center"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    t.pickup.confirm
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default PickupForm;