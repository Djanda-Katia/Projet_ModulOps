import React, { useState, useRef, useEffect } from 'react';
import DatePicker from "react-multi-date-picker";

const PERIODE_LABELS = {
  '7j': '7 derniers jours', '15j': '15 derniers jours',
  '30j': '30 derniers jours', '60j': '60 derniers jours',
  'plus_1an': "Plus d'un an"
};

export default function FilterBar({
  onFilterChange, initialFilters = {},
  showDate = true, showStatus = true, showPerson = false, showSearch = true,
  statusOptions = [], statusFieldName = 'statut',
  personOptions = [], personPlaceholder = "Filtrer par personnes..."
}) {
  const [open, setOpen] = useState(false);
  const [personDropdownOpen, setPersonDropdownOpen] = useState(false);
  const DatePickerComponent = DatePicker.default || DatePicker;

  // Un seul état — chaque changement applique immédiatement
  const [filters, setFilters] = useState({
    dates: [], statuts: [], personne_ids: [], search: ''
  });

  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setPersonDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Envoie les filtres au parent immédiatement
  const emit = (newFilters) => {
    const clean = {};
    clean[statusFieldName] = newFilters.statuts.join(',');
    clean.personne_id = newFilters.personne_ids.join(',');
    clean.search = newFilters.search;
    if (newFilters.dates.length > 0) {
      clean.dates = newFilters.dates.map(d => d?.format ? d.format('YYYY-MM-DD') : d).join(',');
    } else {
      clean.dates = '';
    }
    clean.periode = ''; // Override removed periode
    onFilterChange(clean);
  };

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    emit(next);
  };

  const toggleStatus = (val) => {
    const s = String(val);
    const next = filters.statuts.includes(s)
      ? filters.statuts.filter(x => x !== s)
      : [...filters.statuts, s];
    update('statuts', next);
  };

  const togglePerson = (val) => {
    const s = String(val);
    const next = filters.personne_ids.includes(s)
      ? filters.personne_ids.filter(x => x !== s)
      : [...filters.personne_ids, s];
    update('personne_ids', next);
  };

  const handleClear = () => {
    const empty = { dates: [], statuts: [], personne_ids: [], search: '' };
    setFilters(empty);
    emit(empty);
    setOpen(false);
  };

  // Badge = total filtres actifs
  const activeCount =
    (filters.dates.length > 0 ? 1 : 0) +
    filters.statuts.length +
    filters.personne_ids.length +
    (filters.search ? 1 : 0);

  // Chips
  const chips = [];
  filters.statuts.forEach(v => {
    const opt = statusOptions.find(o => String(o.value) === v);
    chips.push({ key: `s_${v}`, label: opt?.label || v, onRemove: () => toggleStatus(v) });
  });
  filters.personne_ids.forEach(v => {
    const opt = personOptions.find(o => String(o.value) === v);
    chips.push({ key: `p_${v}`, label: opt?.label || v, onRemove: () => togglePerson(v) });
  });
  if (filters.search)
    chips.push({ key: 'search', label: `"${filters.search}"`, onRemove: () => update('search', '') });
  if (filters.dates.length > 0)
    chips.push({
      key: 'dates',
      label: filters.dates.length === 2
        ? `${filters.dates[0]?.format ? filters.dates[0].format('DD/MM/YYYY') : filters.dates[0]} - ${filters.dates[1]?.format ? filters.dates[1].format('DD/MM/YYYY') : filters.dates[1]}`
        : (filters.dates[0]?.format ? filters.dates[0].format('DD/MM/YYYY') : filters.dates[0]),
      onRemove: () => update('dates', [])
    });

  return (
    <div className="flex items-center justify-end gap-2 flex-wrap mb-4" ref={ref}>
      <div className="relative">

        {/* ── Bouton principal ── */}
        <button
          onClick={() => setOpen(p => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm select-none ${
            open
              ? 'bg-blue-600 text-white border-blue-600'
              : activeCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
          Filtrer les résultats

          {/* ── BADGE ── */}
          {activeCount > 0 && (
            <span className={`min-w-[22px] h-[22px] px-1 rounded-full text-[11px] font-black flex items-center justify-center ${
              open ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
            }`}>
              {activeCount}
            </span>
          )}
        </button>

        {/* ── Panneau déroulant ── */}
        {open && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)] p-5 w-[390px] space-y-5">

            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm font-black text-gray-800">Filtres avancés</span>
              {activeCount > 0 && (
                <button onClick={handleClear} className="text-xs text-red-500 font-bold hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors">
                  ✕ Réinitialiser tout
                </button>
              )}
            </div>

            {/* Recherche */}
            {showSearch && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mots-clés</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={e => update('search', e.target.value)}
                    placeholder="Chercher..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Période */}
            {showDate && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Filtrer par date</label>
                <DatePickerComponent
                  range
                  value={filters.dates}
                  onChange={d => update('dates', d || [])}
                  format="DD/MM/YYYY" placeholder="Date de début - Date de fin"
                  containerClassName="w-full"
                  inputClass="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Statuts — clic instantané */}
            {showStatus && statusOptions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  Statuts
                  {filters.statuts.length > 0 && (
                    <span className="ml-2 bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black">{filters.statuts.length}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(opt => {
                    const selected = filters.statuts.includes(String(opt.value));
                    return (
                      <button key={opt.value} onClick={() => toggleStatus(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        {selected && '✓ '}{opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Personnes — clic instantané */}
            {showPerson && personOptions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  Personnes
                  {filters.personne_ids.length > 0 && (
                    <span className="ml-2 bg-blue-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-black">{filters.personne_ids.length}</span>
                  )}
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  {personOptions.map(opt => {
                    const checked = filters.personne_ids.includes(String(opt.value));
                    return (
                      <label key={opt.value} onClick={() => togglePerson(opt.value)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${checked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                          {checked && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                        </div>
                        <span className={`text-sm font-medium ${checked ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Chips ── */}
      {chips.length > 0 && (
        <div className="flex items-center gap-1.5 ml-2 border-l pl-3 border-gray-200 flex-wrap">
          {chips.map(chip => (
            <span key={chip.key}
              className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              {chip.label}
              <button onClick={chip.onRemove}
                className="text-blue-400 hover:text-red-500 transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
