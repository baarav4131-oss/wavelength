import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search records…',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-3.5 h-3.5 absolute left-3 text-[#686e7d] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0e1015] border border-white/10 focus:border-[#e8a33d] text-[#f1eee6] text-xs pl-8.5 pr-8 py-2 rounded transition-colors placeholder:text-[#5c6070] outline-none"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 p-0.5 text-[#686e7d] hover:text-[#f1eee6] cursor-pointer rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
