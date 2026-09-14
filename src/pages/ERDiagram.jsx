import React, { useState } from 'react';
import {
  Search,
  Database,
} from 'lucide-react';
import { SCHEMA } from '../data/schema';

export const ERDiagram = ({ onNavigate }) => {
  const [selectedEntity, setSelectedEntity] = useState(SCHEMA[0]); // default to Songs
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Groups
  const groups = ['ALL', 'MUSIC', 'PODCASTS', 'ACCOUNTS'];

  // Filtered tables
  const filteredSchemas = SCHEMA.filter((s) => {
    if (groupFilter !== 'ALL' && s.group !== groupFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const nameMatch = s.label.toLowerCase().includes(q) || s.sqlTable.toLowerCase().includes(q);
      const colMatch = s.columns.some((c) => c.name.toLowerCase().includes(q));
      return nameMatch || colMatch;
    }
    return true;
  });

  // Calculate relationships for selected entity
  const outgoingFKs = selectedEntity.columns.filter((c) => c.type === 'fk');
  const incomingFKs = SCHEMA.flatMap((s) =>
    s.columns
      .filter((c) => c.type === 'fk' && c.ref === selectedEntity.key)
      .map((c) => ({
        sourceTable: s.sqlTable,
        sourceSchema: s,
        sourceCol: c.name,
        targetCol: c.targetPK || selectedEntity.pk,
      }))
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-semibold text-[#f1eee6] tracking-tight">
              Entity Relationship (ER) Model
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#e8a33d]/15 text-[#e8a33d] border border-[#e8a33d]/30">
              11 Relational Entities · BCNF
            </span>
          </div>
          <p className="text-xs text-[#9aa0ae] mt-1">
            Visual relational schema explorer with explicit Primary Key (🔑) and Foreign Key (🔗) attribution.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-[#11141b] border border-white/10 px-3 py-1.5 rounded font-mono">
          <div className="flex items-center gap-1.5 text-[#e8a33d]">
            <span>🔑</span>
            <span>Primary Key</span>
          </div>
          <span className="text-[#5c6070]">·</span>
          <div className="flex items-center gap-1.5 text-[#5b9bd5]">
            <span>🔗</span>
            <span>Foreign Key</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Group filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-[#111319] border border-white/[0.07]">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#686e7d]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find table or column in schema…"
            className="w-full bg-[#0c0e14] border border-white/10 focus:border-[#e8a33d] text-[#f1eee6] text-xs pl-8 pr-3 py-1.5 rounded outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                groupFilter === g
                  ? 'bg-[#e8a33d] text-[#0c0e14] font-semibold'
                  : 'bg-white/5 text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Entity Cards (Left) + Selected Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Entity Cards Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSchemas.map((schema) => {
            const isSelected = selectedEntity.key === schema.key;
            return (
              <div
                key={schema.key}
                onClick={() => setSelectedEntity(schema)}
                className={`rounded-md border transition-all duration-200 cursor-pointer overflow-hidden ${
                  isSelected
                    ? 'border-[#e8a33d] bg-[#141722] shadow-lg shadow-[#e8a33d]/10 ring-1 ring-[#e8a33d]'
                    : 'border-white/[0.08] bg-[#0f1117] hover:border-white/20 hover:bg-[#12151e]'
                }`}
              >
                {/* Entity Card Header */}
                <div
                  className={`px-4 py-2.5 flex items-center justify-between border-b ${
                    isSelected
                      ? 'bg-[#181d29] border-[#e8a33d]/30 text-[#f1eee6]'
                      : 'bg-[#0b0c10] border-white/[0.06] text-[#9aa0ae]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-[#e8a33d]' : 'text-[#686e7d]'}`} />
                    <h3 className="font-semibold text-xs text-[#f1eee6]">{schema.sqlTable}</h3>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/5 text-[#9aa0ae] rounded">
                    {schema.group}
                  </span>
                </div>

                {/* Columns List */}
                <div className="p-3 space-y-1.5 font-mono text-[11px]">
                  {schema.columns.map((col) => {
                    const isColPk = col.type === 'pk' || col.isPk;
                    const isColFk = col.type === 'fk';

                    return (
                      <div
                        key={col.name}
                        className={`flex items-center justify-between px-2 py-1 rounded ${
                          isColPk
                            ? 'bg-[#e8a33d]/10 text-[#e8a33d]'
                            : isColFk
                            ? 'bg-[#5b9bd5]/10 text-[#7fb2e6]'
                            : 'text-[#dcd8ce] hover:bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isColPk && <span className="text-[10px]">🔑</span>}
                          {isColFk && <span className="text-[10px]">🔗</span>}
                          <span className="font-medium truncate">{col.name}</span>
                        </div>
                        <span className="text-[10px] text-[#686e7d] shrink-0">
                          {isColFk ? `→ ${col.ref}` : col.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Entity Inspector Panel (Right) */}
        <div className="lg:col-span-4 rounded-md border border-white/[0.08] bg-[#0c0e14] p-5 space-y-5 sticky top-24 shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#e8a33d] uppercase tracking-wider">
                Relational Inspector
              </span>
              <button
                onClick={() => onNavigate(selectedEntity.key)}
                className="text-[11px] text-[#e8a33d] hover:underline flex items-center gap-1 font-mono cursor-pointer"
              >
                Open Table →
              </button>
            </div>
            <h2 className="text-xl font-display font-bold text-[#f1eee6] mt-1">
              {selectedEntity.sqlTable}
            </h2>
            <p className="text-xs text-[#9aa0ae] mt-1 leading-relaxed">
              {selectedEntity.description}
            </p>
          </div>

          {/* Key Constraints */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-2 text-xs">
            <div className="text-[11px] font-mono text-[#8a90a0] uppercase tracking-wider">
              Primary Key Specification
            </div>
            {selectedEntity.isCompositePk ? (
              <div className="space-y-1">
                <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-[#e8a33d]/20 text-[#e8a33d] font-mono font-semibold">
                  COMPOSITE PK: [{selectedEntity.pkFields.join(' + ')}]
                </span>
                <p className="text-[11px] text-[#9aa0ae]">
                  Uniqueness is determined jointly by both attributes.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#e8a33d] font-semibold">{selectedEntity.pk}</span>
                <span className="text-[10px] text-[#686e7d]">(Prefix: {selectedEntity.prefix}___)</span>
              </div>
            )}
          </div>

          {/* Outgoing Foreign Keys (References) */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8a90a0] uppercase tracking-wider flex items-center gap-1.5">
              <span>Outgoing Foreign Keys (N:1)</span>
            </div>
            {outgoingFKs.length === 0 ? (
              <div className="text-xs text-[#686e7d] italic font-mono p-2 bg-white/[0.01] rounded">
                No foreign references (Root entity)
              </div>
            ) : (
              <div className="space-y-1.5">
                {outgoingFKs.map((fk) => (
                  <div
                    key={fk.name}
                    className="p-2 rounded bg-[#5b9bd5]/10 border border-[#5b9bd5]/20 text-xs font-mono text-[#7fb2e6] flex items-center justify-between"
                  >
                    <span>{fk.name}</span>
                    <span className="text-[#9aa0ae] text-[10px]">
                      REFERENCES {fk.ref}({fk.targetPK || 'ID'})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Foreign Keys (Referenced by other tables) */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-[#8a90a0] uppercase tracking-wider flex items-center gap-1.5">
              <span>Referenced By Tables (1:N)</span>
            </div>
            {incomingFKs.length === 0 ? (
              <div className="text-xs text-[#686e7d] italic font-mono p-2 bg-white/[0.01] rounded">
                No child tables reference this entity
              </div>
            ) : (
              <div className="space-y-1.5">
                {incomingFKs.map((fk, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#3fc9b0]/10 border border-[#3fc9b0]/20 text-xs font-mono text-[#3fc9b0] flex items-center justify-between"
                  >
                    <span>{fk.sourceTable}.{fk.sourceCol}</span>
                    <span className="text-[#9aa0ae] text-[10px]">→ {fk.targetCol}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
