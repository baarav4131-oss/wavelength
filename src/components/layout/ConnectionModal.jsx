import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/useToast';

import { tryConnect, disconnect, getApiConfig } from '../../services/api';
import { CheckCircle2, AlertCircle, Wifi, Unplug } from 'lucide-react';

export const ConnectionModal = ({ isOpen, onClose, onStatusChange }) => {
  const config = getApiConfig();
  const [url, setUrl] = useState(config.baseUrl || 'http://localhost:5000/api');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const { toast } = useToast();

  const handleTestAndConnect = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await tryConnect(url);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      toast('Connected to backend API!');
      if (onStatusChange) onStatusChange();
      setTimeout(onClose, 800);
    } else {
      toast(res.message, 'error');
      if (onStatusChange) onStatusChange();
    }
  };

  const handleDisconnect = () => {
    const res = disconnect();
    setTestResult(res);
    toast('Switched back to Demo Mode');
    if (onStatusChange) onStatusChange();
    setTimeout(onClose, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Database Connection Settings"
      subtitle="Connect Wavelength to your team's live REST & SQL backend"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleTestAndConnect} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#f1eee6] mb-1.5 uppercase tracking-wider">
            Backend REST Base URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:5000/api"
              className="w-full bg-[#0a0c10] border border-white/15 focus:border-[#e8a33d] text-[#f1eee6] px-3.5 py-2.5 rounded text-xs font-mono outline-none transition-colors"
              required
            />
          </div>
          <p className="text-[11px] text-[#9aa0ae] mt-1.5 leading-relaxed">
            The frontend makes calls to endpoints like <span className="font-mono text-[#f1eee6]">/users</span>,{' '}
            <span className="font-mono text-[#f1eee6]">/songs</span>, and <span className="font-mono text-[#f1eee6]">/query</span>.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="pt-1">
          <span className="text-[11px] text-[#686e7d] block mb-1.5">Common Local Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'http://localhost:5000/api',
              'http://localhost:8000/api',
              'http://localhost:3000/api',
              'http://127.0.0.1:5000/api',
            ].map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setUrl(preset)}
                className="px-2 py-1 text-[10px] font-mono bg-white/5 hover:bg-white/10 text-[#9aa0ae] hover:text-[#f1eee6] rounded border border-white/5 transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Status feedback */}
        {testResult && (
          <div
            className={`p-3 rounded border text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-[#3fc9b0]/10 border-[#3fc9b0]/30 text-[#3fc9b0]'
                : 'bg-[#e2665f]/10 border-[#e2665f]/30 text-[#f87171]'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{testResult.success ? 'Backend Connected' : 'Connection Failed'}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Current status banner */}
        <div className="p-3 bg-white/5 border border-white/10 rounded flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                config.mode === 'live' ? 'bg-[#3fc9b0] shadow-sm shadow-[#3fc9b0]' : 'bg-[#e8a33d]'
              }`}
            />
            <span className="text-[#f1eee6]">
              Current mode: <strong className="uppercase">{config.mode}</strong>
            </span>
          </div>
          {config.mode === 'live' && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              icon={Unplug}
              onClick={handleDisconnect}
            >
              Switch to Demo
            </Button>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" icon={Wifi} loading={testing}>
            Test & Connect
          </Button>
        </div>
      </form>
    </Modal>
  );
};
