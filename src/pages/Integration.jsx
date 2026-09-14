import React, { useState } from 'react';
import {
  Copy,
  Check,
  Globe,
  Wifi,
} from 'lucide-react';
import { SCHEMA } from '../data/schema';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/useToast';

import { getApiConfig, tryConnect } from '../services/api';

export const Integration = () => {
  const [selectedEntity, setSelectedEntity] = useState(SCHEMA[0]);
  const [copiedKey, setCopiedKey] = useState(null);
  const [testUrl, setTestUrl] = useState(getApiConfig().baseUrl);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);


  const { toast } = useToast();
  const config = getApiConfig();

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestConnection = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestStatus(null);
    const res = await tryConnect(testUrl);
    setTesting(false);
    setTestStatus(res);
    toast(res.message, res.success ? 'success' : 'error');
  };

  // Sample JSON payload for selected entity
  const samplePayload = {};
  selectedEntity.columns.forEach((c) => {
    if (c.type !== 'pk') {
      samplePayload[c.name] =
        c.type === 'number'
          ? 214
          : c.type === 'date'
          ? '2024-01-15'
          : c.type === 'select'
          ? c.options[0]
          : `Sample ${c.label}`;
    }
  });

  const idExample = selectedEntity.isCompositePk
    ? selectedEntity.pkFields.map((f) => `{${f}}`).join('/')
    : `{${selectedEntity.pk}}`;

  const curlList = `curl -X GET "${config.baseUrl}/${selectedEntity.resource}" -H "Accept: application/json"`;
  const curlCreate = `curl -X POST "${config.baseUrl}/${selectedEntity.resource}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;
  const curlUpdate = `curl -X PUT "${config.baseUrl}/${selectedEntity.resource}/${idExample}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(samplePayload, null, 2)}'`;
  const curlDelete = `curl -X DELETE "${config.baseUrl}/${selectedEntity.resource}/${idExample}"`;

  const curlSql = `curl -X POST "${config.baseUrl}/query" \\
  -H "Content-Type: application/json" \\
  -d '{"sql": "SELECT * FROM ${selectedEntity.sqlTable} LIMIT 5;"}'`;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-7 animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-display font-semibold text-[#f1eee6] tracking-tight">
            Backend API &amp; Integration Guide
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#3fc9b0]/15 text-[#3fc9b0] border border-[#3fc9b0]/30">
            REST + Raw SQL Spec
          </span>
        </div>
        <p className="text-xs text-[#9aa0ae] mt-1 max-w-3xl leading-relaxed">
          Technical contract for the backend engineering team. Built so teammates can connect their Python (Flask/FastAPI), Node.js (Express), or Java/Go backends with zero friction.
        </p>
      </div>

      {/* Backend URL & Live Probe Form */}
      <div className="p-5 rounded-md border border-white/[0.08] bg-[#0c0e14] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase text-[#e8a33d] flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Target Backend URL Configuration</span>
          </span>
          <span className="text-[11px] font-mono text-[#9aa0ae]">
            Active mode: <strong className="text-[#f1eee6] uppercase">{config.mode}</strong>
          </span>
        </div>

        <form onSubmit={handleTestConnection} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="w-full sm:flex-1 bg-[#141720] border border-white/10 focus:border-[#e8a33d] text-[#f1eee6] font-mono text-xs px-3.5 py-2 rounded outline-none"
            placeholder="http://localhost:5000/api"
            required
          />
          <Button type="submit" size="sm" icon={Wifi} loading={testing}>
            Ping &amp; Connect
          </Button>
        </form>

        {testStatus && (
          <div
            className={`p-2.5 rounded text-xs font-mono ${
              testStatus.success
                ? 'bg-[#3fc9b0]/10 text-[#3fc9b0] border border-[#3fc9b0]/20'
                : 'bg-[#e2665f]/10 text-[#f87171] border border-[#e2665f]/20'
            }`}
          >
            {testStatus.message}
          </div>
        )}
      </div>

      {/* Important Architecture Rules Note */}
      <div className="p-4 rounded-md border-l-2 border-[#e8a33d] bg-[#141720] text-xs text-[#9aa0ae] space-y-1.5 leading-relaxed">
        <strong className="text-[#f1eee6] block">Important Backend Integration Notes:</strong>
        <p>
          1. <strong>Backend is the Source of Truth:</strong> Primary key uniqueness, Foreign key validity, NOT NULL, and CHECK constraints must be enforced by your database / SQL server. The frontend validates user input and displays meaningful error alerts.
        </p>
        <p>
          2. <strong>ID Generation:</strong> In demo mode, strings like <code className="font-mono text-[#e8a33d]">U001</code>, <code className="font-mono text-[#e8a33d]">SG001</code> are generated by prefix. Your backend can generate integer auto-increments or custom alphanumeric IDs; the frontend transparently consumes whatever ID is returned.
        </p>
      </div>

      {/* SQL Endpoint Documentation Card */}
      <div className="p-5 rounded-md border border-white/[0.08] bg-[#0c0e14] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-[#e8a33d]/20 text-[#e8a33d]">
              POST
            </span>
            <span className="font-mono text-xs font-semibold text-[#f1eee6]">/query</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9aa0ae]">Raw SQL Execution Endpoint</span>
            <button
              onClick={() => handleCopy(curlSql, 'sql')}
              className="text-[11px] text-[#686e7d] hover:text-[#f1eee6] flex items-center gap-1 font-mono cursor-pointer"
            >
              {copiedKey === 'sql' ? <Check className="w-3 h-3 text-[#3fc9b0]" /> : <Copy className="w-3 h-3" />}
              <span>cURL</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-[#9aa0ae]">
          Used by <strong>SQL Studio</strong>. Receives arbitrary SQL strings from the client and returns tabular rows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#08090d] border border-white/5 rounded space-y-1.5">
            <span className="text-[#686e7d] text-[10px] uppercase">Request Body (JSON)</span>
            <pre className="text-[#3fc9b0] overflow-x-auto">
{`{
  "sql": "SELECT * FROM Song WHERE Duration > 210;"
}`}
            </pre>
          </div>

          <div className="p-3 bg-[#08090d] border border-white/5 rounded space-y-1.5">
            <span className="text-[#686e7d] text-[10px] uppercase">Expected Response (JSON)</span>
            <pre className="text-[#f1eee6] overflow-x-auto">
{`{
  "columns": ["Song_ID", "Title", "Duration"],
  "rows": [
    ["SG001", "Copper Sky", 214],
    ["SG003", "Harbour Lights", 241]
  ]
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#f1eee6]">Resource Endpoints (Per Entity)</h3>
        <div className="flex flex-wrap gap-1.5">
          {SCHEMA.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedEntity(s)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                selectedEntity.key === s.key
                  ? 'bg-[#e8a33d] text-[#0c0e14] font-semibold'
                  : 'bg-white/5 text-[#9aa0ae] hover:text-[#f1eee6] hover:bg-white/10'
              }`}
            >
              /{s.resource}
            </button>
          ))}
        </div>

        {/* Selected Entity Endpoints Detailed Spec */}
        <div className="p-5 rounded-md border border-white/[0.08] bg-[#0c0e14] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h4 className="text-base font-display font-semibold text-[#f1eee6]">
                {selectedEntity.sqlTable} ({selectedEntity.label})
              </h4>
              <p className="text-xs text-[#9aa0ae] font-mono mt-0.5">
                Base Path: /{selectedEntity.resource}
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#e8a33d]">
              PK: {selectedEntity.isCompositePk ? selectedEntity.pkFields.join('+') : selectedEntity.pk}
            </span>
          </div>

          <div className="space-y-4">
            {/* GET */}
            <div className="p-3.5 bg-[#08090d] border border-white/5 rounded space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#3fc9b0]/20 text-[#3fc9b0]">
                    GET
                  </span>
                  <span className="font-mono text-xs text-[#f1eee6]">/{selectedEntity.resource}</span>
                </div>
                <button
                  onClick={() => handleCopy(curlList, 'get')}
                  className="text-[11px] text-[#686e7d] hover:text-[#f1eee6] flex items-center gap-1 font-mono cursor-pointer"
                >
                  {copiedKey === 'get' ? <Check className="w-3 h-3 text-[#3fc9b0]" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>
              <p className="text-[11px] text-[#9aa0ae]">Returns an array of all records matching table columns.</p>
            </div>

            {/* POST */}
            <div className="p-3.5 bg-[#08090d] border border-white/5 rounded space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#e8a33d]/20 text-[#e8a33d]">
                    POST
                  </span>
                  <span className="font-mono text-xs text-[#f1eee6]">/{selectedEntity.resource}</span>
                </div>
                <button
                  onClick={() => handleCopy(curlCreate, 'post')}
                  className="text-[11px] text-[#686e7d] hover:text-[#f1eee6] flex items-center gap-1 font-mono cursor-pointer"
                >
                  {copiedKey === 'post' ? <Check className="w-3 h-3 text-[#3fc9b0]" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>
              <p className="text-[11px] text-[#9aa0ae]">Creates a new record. Returns the created record with generated ID.</p>
              <pre className="p-2.5 bg-black/40 rounded text-[11px] font-mono text-[#dcd8ce] overflow-x-auto">
                {JSON.stringify(samplePayload, null, 2)}
              </pre>
            </div>

            {/* PUT */}
            <div className="p-3.5 bg-[#08090d] border border-white/5 rounded space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#5b9bd5]/20 text-[#5b9bd5]">
                    PUT
                  </span>
                  <span className="font-mono text-xs text-[#f1eee6]">/{selectedEntity.resource}/{idExample}</span>
                </div>
                <button
                  onClick={() => handleCopy(curlUpdate, 'put')}
                  className="text-[11px] text-[#686e7d] hover:text-[#f1eee6] flex items-center gap-1 font-mono cursor-pointer"
                >
                  {copiedKey === 'put' ? <Check className="w-3 h-3 text-[#3fc9b0]" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>
              <p className="text-[11px] text-[#9aa0ae]">Updates an existing record by ID. Returns updated record.</p>
            </div>

            {/* DELETE */}
            <div className="p-3.5 bg-[#08090d] border border-white/5 rounded space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#e2665f]/20 text-[#e2665f]">
                    DELETE
                  </span>
                  <span className="font-mono text-xs text-[#f1eee6]">/{selectedEntity.resource}/{idExample}</span>
                </div>
                <button
                  onClick={() => handleCopy(curlDelete, 'delete')}
                  className="text-[11px] text-[#686e7d] hover:text-[#f1eee6] flex items-center gap-1 font-mono cursor-pointer"
                >
                  {copiedKey === 'delete' ? <Check className="w-3 h-3 text-[#3fc9b0]" /> : <Copy className="w-3 h-3" />}
                  <span>cURL</span>
                </button>
              </div>
              <p className="text-[11px] text-[#9aa0ae]">Deletes the record permanently. Returns HTTP 204 or {`{"success": true}`}.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
