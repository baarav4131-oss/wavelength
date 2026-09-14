import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Download,
  AlertCircle,
  Copy,
  Terminal,
  History,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { QUICK_QUERIES } from '../utils/sqlEngine';
import { apiRunSQL, getApiConfig } from '../services/api';
import { useToast } from '../components/ui/useToast';


export const SQLStudio = () => {
  const [sql, setSql] = useState(QUICK_QUERIES[0].sql);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [execTime, setExecTime] = useState(null);
  const [history, setHistory] = useState([
    QUICK_QUERIES[0].sql,
    QUICK_QUERIES[1].sql,
  ]);
  const [showHistory, setShowHistory] = useState(false);

  const { toast } = useToast();
  const config = getApiConfig();
  const textareaRef = useRef(null);

  const executeQuery = useCallback(async (queryToRun) => {
    const query = (queryToRun || sql).trim();
    if (!query) return;

    setRunning(true);
    setError(null);
    const t0 = performance.now();

    try {
      const res = await apiRunSQL(query);
      const dt = (performance.now() - t0).toFixed(1);
      setExecTime(dt);
      setResults(res);

      // Add to history if unique
      setHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 15));
    } catch (err) {
      setError(err.message || 'SQL execution failed');
      setResults(null);
    } finally {
      setRunning(false);
    }
  }, [sql]);

  // Run initial query on mount
  useEffect(() => {
    executeQuery(QUICK_QUERIES[0].sql);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut Ctrl + Enter / Cmd + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeQuery]);


  // Format SQL lightly
  const handleFormatSQL = () => {
    const formatted = sql
      .replace(/\s+/g, ' ')
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bLIMIT\b/gi, '\nLIMIT')
      .trim();

    setSql(formatted);
    toast('SQL formatting applied');
  };

  const handleClear = () => {
    setSql('');
    setResults(null);
    setError(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleExportCSV = () => {
    if (!results || !results.rows || results.rows.length === 0) return;
    const headerLine = results.columns.join(',');
    const rowsLines = results.rows.map((r) =>
      r.map((val) => JSON.stringify(val ?? '')).join(',')
    );
    const csvContent = [headerLine, ...rowsLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    link.click();
    toast('Results exported to CSV');
  };

  const handleCopyResults = () => {
    if (!results || !results.rows) return;
    const jsonStr = JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(jsonStr);
    toast('Results copied to clipboard as JSON');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.07]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-display font-semibold text-[#f1eee6] tracking-tight">
              SQL Studio
            </h1>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                config.mode === 'live'
                  ? 'bg-[#3fc9b0]/15 text-[#3fc9b0] border-[#3fc9b0]/30'
                  : 'bg-[#e8a33d]/15 text-[#e8a33d] border-[#e8a33d]/30'
              }`}
            >
              ● {config.mode === 'live' ? 'POST /query (LIVE DB)' : 'CLIENT ENGINE (DEMO)'}
            </span>
          </div>
          <p className="text-xs text-[#9aa0ae]">
            Direct database IDE console. Execute custom relational queries, multi-table joins, and aggregate reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={History}
            onClick={() => setShowHistory(!showHistory)}
            title="Toggle query history"
          >
            History
          </Button>
        </div>
      </div>

      {/* Query History Drawer if toggled */}
      {showHistory && (
        <div className="p-4 rounded-md bg-[#0c0e14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#9aa0ae] font-mono mb-2">
            <span>RECENT QUERY LOG</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-[11px] text-[#686e7d] hover:text-[#f1eee6] cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {history.map((h, i) => (
              <div
                key={i}
                onClick={() => {
                  setSql(h);
                  executeQuery(h);
                }}
                className="p-2 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-xs font-mono text-[#9aa0ae] hover:text-[#e8a33d] cursor-pointer flex items-center justify-between transition-colors"
              >
                <span className="truncate max-w-xl">{h.replace(/\n/g, ' ')}</span>
                <span className="text-[10px] text-[#5c6070] shrink-0">Click to run</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQL Editor Container */}
      <div className="rounded-md border border-white/[0.08] bg-[#0c0e13] overflow-hidden shadow-2xl">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#12151d] border-b border-white/[0.07]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#686e7d]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2665f]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8a33d]/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3fc9b0]/80" />
            <span className="ml-2 text-[#9aa0ae] text-[11px]">query_session.sql</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatSQL}
              className="text-[11px] text-[#9aa0ae] hover:text-[#f1eee6] px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              Format
            </button>
            <button
              onClick={handleClear}
              className="text-[11px] text-[#9aa0ae] hover:text-[#e2665f] px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Textarea Editor */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full bg-[#08090c] text-[#3fc9b0] font-mono text-xs sm:text-sm p-4 outline-none resize-y border-none leading-relaxed selection:bg-[#3fc9b0]/20 placeholder:text-[#5c6070]"
            placeholder="SELECT * FROM Song JOIN Album ON Song.Album_ID = Album.Album_ID;"
          />
        </div>

        {/* Editor Bottom Run Row */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e1015] border-t border-white/[0.07]">
          <div className="flex items-center gap-3 text-[11px] text-[#686e7d]">
            <span>Press <kbd className="font-mono text-[#9aa0ae] bg-white/10 px-1 py-0.5 rounded">Ctrl</kbd> + <kbd className="font-mono text-[#9aa0ae] bg-white/10 px-1 py-0.5 rounded">Enter</kbd> to run</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Play}
            onClick={() => executeQuery()}
            loading={running}
          >
            Run Query
          </Button>
        </div>
      </div>

      {/* Quick Queries Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#686e7d] block">
          Quick Relational Templates:
        </span>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUERIES.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setSql(q.sql);
                executeQuery(q.sql);
              }}
              className="px-3 py-1.5 rounded text-xs font-mono bg-[#11141b] hover:bg-[#181d28] text-[#9aa0ae] hover:text-[#e8a33d] border border-white/[0.07] hover:border-[#e8a33d]/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Terminal className="w-3 h-3 text-[#e8a33d]" />
              <span>{q.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#f1eee6]">Results</h3>
            {results && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#9aa0ae]">
                {results.rows ? results.rows.length : 0} {results.rows?.length === 1 ? 'row' : 'rows'}
                {execTime && ` · ${execTime} ms`}
              </span>
            )}
          </div>

          {results && results.rows && results.rows.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Copy}
                onClick={handleCopyResults}
              >
                Copy JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-md border border-[#e2665f]/30 bg-[#e2665f]/10 text-xs font-mono text-[#f87171] space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>SQL Execution Error:</span>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] pl-6">{error}</pre>
          </div>
        )}

        {/* Results Table */}
        {results && results.columns && (
          <div className="w-full overflow-x-auto border border-white/[0.07] rounded-md bg-[#0c0e14]">
            {results.rows && results.rows.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#686e7d] font-mono">
                Query executed successfully. 0 rows returned.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-[#12151d]">
                    {results.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-2.5 font-semibold text-[#e8a33d] text-[11px] tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {results.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((val, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-[#dcd8ce]">
                          {val === null || val === undefined ? (
                            <span className="text-[#5c6070] italic">NULL</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
