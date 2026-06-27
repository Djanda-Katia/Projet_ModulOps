/**
 * PeriodSelector — Composant de filtrage temporel professionnel
 * Inspiré des dashboards Stripe / Fintech
 * Valeurs : 'today' | 'week' | '7j' | '30j' | '6m' | 'year' | 'last_year' | { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 */
import { useState, useRef, useEffect } from "react";

const PERIODS = [
  { value: 'today',     label: "Aujourd'hui",   icon: 'today' },
  { value: 'week',      label: 'Cette semaine',  icon: 'date_range' },
  { value: '7j',        label: '7 derniers jours', icon: 'history' },
  { value: '30j',       label: '30 derniers jours', icon: 'calendar_month' },
  { value: '6m',        label: '6 derniers mois',  icon: 'schedule' },
  { value: 'year',      label: 'Cette année',    icon: 'event_note' },
  { value: 'last_year', label: 'Année précédente', icon: 'history_edu' },
];

/**
 * Calcule la date de coupure pour un filtre donné.
 * Retourne null si la valeur est 'all' (pas de filtre).
 */
export const getCutoffDate = (period) => {
  if (typeof period === 'object' && period.start && period.end) {
    return { start: new Date(`${period.start}T00:00:00`), end: new Date(`${period.end}T23:59:59`) };
  }

  const now = new Date();
  switch (period) {
    case 'today': {
      const d = new Date(now); d.setHours(0, 0, 0, 0); return d;
    }
    case 'week': {
      const d = new Date(now);
      const day = d.getDay(); // 0=dim
      d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case '7j': {
      const d = new Date(now); d.setDate(d.getDate() - 7); d.setHours(0,0,0,0); return d;
    }
    case '30j': {
      const d = new Date(now); d.setDate(d.getDate() - 30); d.setHours(0,0,0,0); return d;
    }
    case '6m': {
      const d = new Date(now); d.setMonth(d.getMonth() - 6); d.setHours(0,0,0,0); return d;
    }
    case 'year': {
      return new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    }
    case 'last_year': {
      const y = now.getFullYear() - 1;
      // entre le 1er janvier et le 31 décembre de l'année précédente
      return { start: new Date(y, 0, 1), end: new Date(y, 11, 31, 23, 59, 59) };
    }
    default: return null;
  }
};

/**
 * Filtre un tableau d'items par période.
 * @param {Array} items
 * @param {string|Object} period
 * @param {string} dateField - champ date à comparer
 */
export const filterByPeriod = (items, period, dateField = 'created_at') => {
  if (!items) return [];
  const cutoff = getCutoffDate(period);
  if (!cutoff) return items;

  // Cas spécial : last_year ou custom retourne un objet { start, end }
  if (cutoff.start && cutoff.end) {
    return items.filter(item => {
      const d = new Date(item[dateField]);
      return d >= cutoff.start && d <= cutoff.end;
    });
  }

  return items.filter(item => new Date(item[dateField]) >= cutoff);
};

/**
 * Retourne les paramètres API correspondant à la période.
 * Utilisé pour forcer le backend à filtrer exactement comme on veut.
 */
export const getPeriodApiParam = (period) => {
  if (typeof period === 'object' && period.start && period.end) {
    return { dates: `${period.start},${period.end}` };
  }

  const cutoff = getCutoffDate(period);
  if (!cutoff) return {};

  const fmt = (d) => d.toISOString().slice(0, 10);

  if (cutoff.start && cutoff.end) {
    return { dates: `${fmt(cutoff.start)},${fmt(cutoff.end)}` };
  }

  return { dates: `${fmt(cutoff)},${fmt(new Date())}` };
};

export default function PeriodSelector({ value, onChange, compact = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const containerRef = useRef(null);

  const isCustom = typeof value === 'object' && value !== null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customDates.start && customDates.end) {
      onChange(customDates);
      setIsOpen(false);
      setShowCustom(false);
    }
  };

  const getLabel = () => {
    if (isCustom) return "Période personnalisée";
    const found = PERIODS.find(p => p.value === value);
    return found ? found.label : "Filtrer";
  };

  return (
    <div className={`relative ${compact ? 'text-[11px]' : 'text-sm'}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
      >
        <span className="material-symbols-outlined text-gray-400 text-[18px]">calendar_month</span>
        {getLabel()}
        <span className={`material-symbols-outlined text-[18px] text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
          
          {!showCustom ? (
            <div className="py-2">
              {PERIODS.map(p => (
                <button
                  key={p.value}
                  onClick={() => { onChange(p.value); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    value === p.value
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${value === p.value ? 'text-blue-500' : 'text-gray-400'}`}>
                    {p.icon}
                  </span>
                  {p.label}
                </button>
              ))}
              
              <div className="h-px bg-gray-100 my-2" />
              
              <button
                onClick={() => setShowCustom(true)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  isCustom
                    ? 'bg-purple-50 text-purple-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isCustom ? 'text-purple-500' : 'text-gray-400'}`}>
                  edit_calendar
                </span>
                Personnalisé...
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={() => setShowCustom(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
                <span className="font-bold text-gray-800">Personnalisé</span>
              </div>
              
              <form onSubmit={handleCustomSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date de début</label>
                  <input 
                    type="date" 
                    value={customDates.start} 
                    onChange={e => setCustomDates({...customDates, start: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Date de fin</label>
                  <input 
                    type="date" 
                    value={customDates.end} 
                    onChange={e => setCustomDates({...customDates, end: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    required 
                  />
                </div>
                <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-sm">
                  Appliquer
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
