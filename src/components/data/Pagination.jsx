import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= 10 && pageSize === 10) {
    return (
      <div className="flex items-center justify-between text-xs text-[#686e7d] py-3 px-2">
        <span>{totalItems} total {totalItems === 1 ? 'record' : 'records'}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#9aa0ae] py-3 px-2 border-t border-white/[0.07]">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="text-[#f1eee6]">{start}</strong> to{' '}
          <strong className="text-[#f1eee6]">{end}</strong> of{' '}
          <strong className="text-[#f1eee6]">{totalItems}</strong> records
        </span>

        {/* Page size dropdown */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[#686e7d] text-[11px]">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-[#0e1015] border border-white/10 text-[#f1eee6] text-xs px-2 py-0.5 rounded outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[#f1eee6] border border-white/5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2.5 py-0.5 text-xs font-mono text-[#f1eee6]">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-[#f1eee6] border border-white/5 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
