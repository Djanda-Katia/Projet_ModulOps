import React from 'react';

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (lastPage <= 1) return null;

  // Créer un tableau de pages [1, 2, 3, ...]
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-all"
      >
        Précédent
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
            currentPage === page 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}

      <button 
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-all"
      >
        Suivant
      </button>
    </div>
  );
}
