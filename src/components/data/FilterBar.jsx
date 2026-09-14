import React from 'react';
import { Filter, X } from 'lucide-react';

export const FilterBar = ({
  schema,
  filters = {},
  onFilterChange,
  onClearFilters,
  foreignCache = {},
}) => {
  const filterableColumns = schema.columns.filter((col) => col.filterable);

  if (filterableColumns.length === 0) return null;

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs text-[#686e7d] mr-1">
        <Filter className="w-3 h-3 text-[#e8a33d]" />
        <span>Filters:</span>
      </div>

      {filterableColumns.map((col) => {
        // If it's a foreign key filter
        if (col.type === 'fk') {
          const foreignList = foreignCache[col.ref] || [];
          return (
            <select
              key={col.name}
              value={filters[col.name] || ''}
              onChange={(e) => onFilterChange(col.name, e.target.value)}
              className={`bg-[#0e1015] border text-xs px-2.5 py-1.5 rounded outline-none transition-colors cursor-pointer appearance-none ${
                filters[col.name]
                  ? 'border-[#e8a33d] text-[#e8a33d] bg-[#e8a33d]/5 font-medium'
                  : 'border-white/10 text-[#9aa0ae] hover:border-white/20'
              }`}
            >
              <option value="">{col.label}: All</option>
              {foreignList.map((item) => {
                const id = item[col.targetPK || 'ID'];
                const label = item[col.display] || item.Name || item.Title || id;
                return (
                  <option key={id} value={id}>
                    {col.label}: {label}
                  </option>
                );
              })}
            </select>
          );
        }

        // Standard select options
        if (col.options) {
          return (
            <select
              key={col.name}
              value={filters[col.name] || ''}
              onChange={(e) => onFilterChange(col.name, e.target.value)}
              className={`bg-[#0e1015] border text-xs px-2.5 py-1.5 rounded outline-none transition-colors cursor-pointer appearance-none ${
                filters[col.name]
                  ? 'border-[#e8a33d] text-[#e8a33d] bg-[#e8a33d]/5 font-medium'
                  : 'border-white/10 text-[#9aa0ae] hover:border-white/20'
              }`}
            >
              <option value="">{col.label}: All</option>
              {col.options.map((opt) => (
                <option key={opt} value={opt}>
                  {col.label}: {opt}
                </option>
              ))}
            </select>
          );
        }

        return null;
      })}

      {activeCount > 0 && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1 text-[11px] text-[#e2665f] hover:text-[#f87171] px-2 py-1 bg-[#e2665f]/10 rounded border border-[#e2665f]/20 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          <span>Clear ({activeCount})</span>
        </button>
      )}
    </div>
  );
};
