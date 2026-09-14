import React, { useState, useEffect } from 'react';
import { getSchema } from '../../data/schema';
import { apiList } from '../../services/api';
import { ChevronDown } from 'lucide-react';

export const ForeignKeySelect = ({
  schemaRef,
  value,
  onChange,
  required = false,
  displayField = 'Title',
  targetPk = 'ID',
  name,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchRefData = async () => {
      try {
        setLoading(true);
        const refSchema = getSchema(schemaRef);
        if (!refSchema) return;
        const data = await apiList(refSchema);
        if (active) setOptions(data);
      } catch (err) {
        console.error(`Failed to load foreign records for ${schemaRef}:`, err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchRefData();
    return () => {
      active = false;
    };
  }, [schemaRef]);

  const targetSchema = getSchema(schemaRef);
  const pkField = targetPk || (targetSchema ? targetSchema.pk : 'ID');

  return (
    <div className="relative">
      <select
        name={name}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={loading}
        className="w-full bg-[#0a0c10] border border-white/15 focus:border-[#e8a33d] text-[#f1eee6] px-3 py-2 rounded text-xs outline-none transition-colors appearance-none cursor-pointer pr-8 font-sans"
      >
        <option value="" className="bg-[#14171f] text-[#686e7d]">
          {loading ? 'Loading related records…' : '— Select related record —'}
        </option>
        {options.map((item) => {
          const idVal = item[pkField];
          const textVal = item[displayField] || item.Name || item.Title || item.First_Name || idVal;
          return (
            <option key={idVal} value={idVal} className="bg-[#14171f] text-[#f1eee6]">
              {idVal} — {textVal}
            </option>
          );
        })}
      </select>
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#686e7d]">
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
