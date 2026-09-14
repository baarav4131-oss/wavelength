import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import { PkBadge, FkBadge } from '../ui/Badge';
import { formatDuration, formatCurrency, formatDate, truncate } from '../../utils/formatters';

export const DataTable = ({
  schema,
  data = [],
  foreignCache = {},
  onEdit,
  onDelete,
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (colName) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    const colDef = schema.columns.find((c) => c.name === sortColumn);
    const sorted = [...data].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (colDef?.type === 'number' || typeof valA === 'number') {
        return sortDirection === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    return sorted;
  }, [data, sortColumn, sortDirection, schema]);

  return (
    <div className="w-full overflow-x-auto border border-white/[0.07] rounded-md bg-[#11141b]/60">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/[0.07] bg-[#0c0e13]">
            {schema.columns.map((col) => {
              const isSorted = sortColumn === col.name;
              return (
                <th
                  key={col.name}
                  onClick={() => handleSort(col.name)}
                  className="px-4 py-3 font-semibold text-[#8a90a0] text-[11px] tracking-wider uppercase select-none cursor-pointer hover:text-[#f1eee6] hover:bg-white/[0.02] transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {col.type === 'pk' || col.isPk ? (
                      <span className="text-[10px] text-[#e8a33d] font-mono">🔑</span>
                    ) : col.type === 'fk' ? (
                      <span className="text-[10px] text-[#5b9bd5] font-mono">🔗</span>
                    ) : null}
                    <span>{col.label}</span>
                    <span className="text-[#5c6070]">
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-[#e8a33d]" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-[#e8a33d]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                      )}
                    </span>
                  </div>
                </th>
              );
            })}
            <th className="px-4 py-3 text-right text-[#8a90a0] text-[11px] font-semibold uppercase tracking-wider w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {sortedData.map((row, index) => (
            <tr
              key={schema.isCompositePk ? schema.pkFields.map((f) => row[f]).join('-') : row[schema.pk] || index}
              className="hover:bg-white/[0.03] transition-colors group"
            >
              {schema.columns.map((col) => {
                const val = row[col.name];

                // PK rendering
                if (col.type === 'pk' || (col.isPk && !col.ref)) {
                  return (
                    <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                      <PkBadge id={val} />
                    </td>
                  );
                }

                // FK rendering
                if (col.type === 'fk') {
                  const refCache = foreignCache[col.ref] || [];
                  const targetPk = col.targetPK || 'ID';
                  const refRow = refCache.find((r) => String(r[targetPk]) === String(val));
                  const displayVal = refRow ? refRow[col.display] : null;

                  return (
                    <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                      {val ? (
                        <FkBadge id={val} label={displayVal} />
                      ) : (
                        <span className="text-[#5c6070] italic">—</span>
                      )}
                    </td>
                  );
                }

                // Duration format
                if (col.format === 'duration') {
                  return (
                    <td key={col.name} className="px-4 py-3 font-mono text-[#f1eee6] whitespace-nowrap">
                      {formatDuration(val)}
                      <span className="text-[#686e7d] text-[10px] ml-1">({val}s)</span>
                    </td>
                  );
                }

                // Currency format
                if (col.format === 'currency') {
                  return (
                    <td key={col.name} className="px-4 py-3 font-mono font-medium text-[#3fc9b0] whitespace-nowrap">
                      {formatCurrency(val)}
                    </td>
                  );
                }

                // Date format
                if (col.type === 'date') {
                  return (
                    <td key={col.name} className="px-4 py-3 text-[#9aa0ae] whitespace-nowrap">
                      {formatDate(val)}
                    </td>
                  );
                }

                // Image / Cover page
                if (col.name === 'Cover_Page' && val) {
                  return (
                    <td key={col.name} className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={val}
                          alt="Cover"
                          className="w-8 h-8 rounded object-cover border border-white/10 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="text-[11px] text-[#686e7d] font-mono truncate max-w-[120px]">
                          {val}
                        </span>
                      </div>
                    </td>
                  );
                }

                // General tag or select
                if (col.type === 'select') {
                  return (
                    <td key={col.name} className="px-4 py-3 whitespace-nowrap">
                      {val ? (
                        <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 border border-white/10 text-[#f1eee6] font-medium">
                          {val}
                        </span>
                      ) : (
                        <span className="text-[#5c6070]">—</span>
                      )}
                    </td>
                  );
                }

                // Fallback text
                return (
                  <td key={col.name} className="px-4 py-3 text-[#dcd8ce] max-w-xs truncate">
                    {val !== null && val !== undefined && val !== '' ? (
                      truncate(String(val), 48)
                    ) : (
                      <span className="text-[#5c6070] italic">—</span>
                    )}
                  </td>
                );
              })}

              {/* Action Buttons */}
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(row)}
                    className="p-1 rounded text-[#9aa0ae] hover:text-[#e8a33d] hover:bg-white/5 transition-colors cursor-pointer"
                    title="Edit record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="p-1 rounded text-[#9aa0ae] hover:text-[#e2665f] hover:bg-[#e2665f]/10 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
