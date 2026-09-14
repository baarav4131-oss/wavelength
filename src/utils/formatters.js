/**
 * WAVELENGTH — FORMATTERS & HELPERS
 */

export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '—';
  const sec = parseInt(seconds, 10);
  if (sec >= 3600) {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  const mins = Math.floor(sec / 60);
  const s = sec % 60;
  return `${mins}:${String(s).padStart(2, '0')}`;
};

export const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `₹${Number(val).toFixed(2)}`;
};

export const formatDate = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return val;
  }
};

export const truncate = (str, max = 50) => {
  if (!str) return '—';
  return str.length > max ? `${str.slice(0, max)}…` : str;
};
