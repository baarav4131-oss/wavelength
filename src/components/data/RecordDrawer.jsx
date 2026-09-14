import React, { useState, useEffect } from 'react';
import { X, Save, Key, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { ForeignKeySelect } from './ForeignKeySelect';

export const RecordDrawer = ({
  isOpen,
  onClose,
  schema,
  record = null,
  onSave,
}) => {
  const isEditing = !!record;
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else {
      // Default empty values
      const initial = {};
      schema.columns.forEach((col) => {
        if (col.type !== 'pk') {
          initial[col.name] = '';
        }
      });
      setFormData(initial);
    }
    setError(null);
  }, [record, schema, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Format payload (convert empty strings to null or numbers)
      const payload = { ...formData };
      schema.columns.forEach((col) => {
        if (col.type === 'number' && payload[col.name] !== '') {
          payload[col.name] = Number(payload[col.name]);
        }
        if (payload[col.name] === '') {
          payload[col.name] = null;
        }
      });

      await onSave(payload, isEditing, record);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save record. Check foreign key constraints.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        className="w-full max-w-md bg-[#12141a] border-l border-white/10 shadow-2xl flex flex-col h-full animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#0b0c10] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[#f1eee6]">
                {isEditing ? `Edit ${schema.singularLabel || schema.label}` : `Add New ${schema.singularLabel || schema.label}`}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white/5 text-[#e8a33d] rounded border border-white/10">
                {schema.sqlTable}
              </span>
            </div>
            <p className="text-[11px] text-[#9aa0ae] mt-0.5">
              {isEditing ? 'Modify attributes and foreign key relations' : 'Insert a new relational record into the database'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#e2665f]/10 border border-[#e2665f]/30 rounded text-xs text-[#f87171] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Constraint / Execution Error</p>
                <p className="text-[11px] mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {schema.columns.map((col) => {
            // Primary key column handling
            if (col.type === 'pk' || col.isPk) {
              const isCompositeChild = schema.isCompositePk && col.name !== schema.columns[0].name;

              if (!isEditing && !isCompositeChild && !schema.isCompositePk) {
                return (
                  <div key={col.name} className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#9aa0ae]">
                      <Key className="w-3 h-3 text-[#e8a33d]" />
                      <span>{col.label}</span>
                      <span className="text-[10px] font-mono text-[#e8a33d]">(PK)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Auto-generated on save"
                      className="w-full bg-[#0a0c10]/60 border border-white/10 text-[#686e7d] px-3 py-2 rounded text-xs font-mono cursor-not-allowed italic"
                    />
                  </div>
                );
              }

              if (isEditing && !isCompositeChild) {
                return (
                  <div key={col.name} className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-[#9aa0ae]">
                      <Key className="w-3 h-3 text-[#e8a33d]" />
                      <span>{col.label}</span>
                      <span className="text-[10px] font-mono text-[#e8a33d]">(PK)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData[col.name] || ''}
                      className="w-full bg-[#0a0c10]/80 border border-white/10 text-[#e8a33d] px-3 py-2 rounded text-xs font-mono font-medium cursor-not-allowed"
                    />
                  </div>
                );
              }
            }

            // Foreign Key column handling
            if (col.type === 'fk') {
              return (
                <div key={col.name} className="space-y-1">
                  <label className="flex items-center justify-between text-xs font-medium text-[#9aa0ae]">
                    <span className="flex items-center gap-1.5">
                      <LinkIcon className="w-3 h-3 text-[#5b9bd5]" />
                      <span>{col.label}</span>
                      <span className="text-[10px] font-mono text-[#5b9bd5]">(FK → {col.ref})</span>
                    </span>
                    {col.required && <span className="text-[#e8a33d] text-[10px]">*required</span>}
                  </label>
                  <ForeignKeySelect
                    schemaRef={col.ref}
                    targetPk={col.targetPK}
                    displayField={col.display}
                    value={formData[col.name]}
                    onChange={(val) => handleChange(col.name, val)}
                    required={col.required}
                    name={col.name}
                  />
                </div>
              );
            }

            // Select Dropdown column handling
            if (col.type === 'select') {
              return (
                <div key={col.name} className="space-y-1">
                  <label className="flex items-center justify-between text-xs font-medium text-[#9aa0ae]">
                    <span>{col.label}</span>
                    {col.required && <span className="text-[#e8a33d] text-[10px]">*required</span>}
                  </label>
                  <select
                    value={formData[col.name] || ''}
                    onChange={(e) => handleChange(col.name, e.target.value)}
                    required={col.required}
                    className="w-full bg-[#0a0c10] border border-white/15 focus:border-[#e8a33d] text-[#f1eee6] px-3 py-2 rounded text-xs outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#14171f] text-[#686e7d]">
                      — Select option —
                    </option>
                    {(col.options || []).map((opt) => (
                      <option key={opt} value={opt} className="bg-[#14171f] text-[#f1eee6]">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // Textarea column handling
            if (col.type === 'textarea') {
              return (
                <div key={col.name} className="space-y-1">
                  <label className="flex items-center justify-between text-xs font-medium text-[#9aa0ae]">
                    <span>{col.label}</span>
                    {col.required && <span className="text-[#e8a33d] text-[10px]">*required</span>}
                  </label>
                  <textarea
                    rows={3}
                    value={formData[col.name] || ''}
                    onChange={(e) => handleChange(col.name, e.target.value)}
                    required={col.required}
                    placeholder={`Enter ${col.label.toLowerCase()}…`}
                    className="w-full bg-[#0a0c10] border border-white/15 focus:border-[#e8a33d] text-[#f1eee6] px-3 py-2 rounded text-xs outline-none transition-colors resize-none font-sans"
                  />
                </div>
              );
            }

            // Standard Inputs (text, number, date, email)
            const inputType =
              col.type === 'date'
                ? 'date'
                : col.type === 'number'
                ? 'number'
                : col.type === 'email'
                ? 'email'
                : 'text';

            return (
              <div key={col.name} className="space-y-1">
                <label className="flex items-center justify-between text-xs font-medium text-[#9aa0ae]">
                  <span>{col.label}</span>
                  {col.required && <span className="text-[#e8a33d] text-[10px]">*required</span>}
                </label>
                <input
                  type={inputType}
                  step={col.format === 'currency' ? '0.01' : undefined}
                  value={formData[col.name] ?? ''}
                  onChange={(e) => handleChange(col.name, e.target.value)}
                  required={col.required}
                  placeholder={`Enter ${col.label.toLowerCase()}`}
                  className="w-full bg-[#0a0c10] border border-white/15 focus:border-[#e8a33d] text-[#f1eee6] px-3 py-2 rounded text-xs outline-none transition-colors"
                />
              </div>
            );
          })}

          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" icon={Save} loading={saving}>
              {isEditing ? 'Save Changes' : 'Create Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
