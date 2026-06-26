import React from 'react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirmer", 
  cancelText = "Annuler", 
  isDanger = false,
  showInput = false,
  inputPlaceholder = "Saisir une valeur...",
  inputValue = "",
  onInputChange = null
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 25px 60px -10px rgba(0,0,0,0.3)' }}
      >
        {/* Header coloré */}
        <div className={`px-6 py-5 flex items-start gap-4 ${isDanger ? 'bg-red-50' : 'bg-blue-50'}`}>
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isDanger ? 'bg-red-100' : 'bg-blue-100'}`}>
            <span className={`material-symbols-outlined text-xl ${isDanger ? 'text-red-600' : 'text-blue-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {isDanger ? 'warning' : 'help'}
            </span>
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className={`text-base font-bold ${isDanger ? 'text-red-900' : 'text-blue-900'}`}>{title}</h3>
            <p className={`text-sm mt-1 leading-relaxed ${isDanger ? 'text-red-700' : 'text-gray-600'}`}>{message}</p>
          </div>
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 -mt-0.5"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Champ de saisie optionnel (ex: motif de rejet) */}
        {showInput && (
          <div className="px-6 pt-4 pb-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange && onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all focus:bg-white"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-6 py-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 font-bold py-3 rounded-xl transition-all text-sm uppercase tracking-wide text-white ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 hover:shadow-red-300' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
