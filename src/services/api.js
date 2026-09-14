/**
 * WAVELENGTH — CENTRAL API SERVICE LAYER
 * Unified interface for CRUD operations and SQL execution across Demo and Live modes.
 */

import { INITIAL_MOCK_DATA } from '../data/mockData';
import { runDemoQuery } from '../utils/sqlEngine';

const STORAGE_KEY_DB = 'wavelength_demo_db_v1';
const STORAGE_KEY_CONFIG = 'wavelength_api_config_v1';

// Load stored config or default
const loadConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return {
    mode: 'demo', // 'demo' | 'live'
    baseUrl: 'http://localhost:5000/api',
  };
};

// Load or initialize mock database
const loadMockDB = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_DB);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
};

let apiConfig = loadConfig();
let mockDatabase = loadMockDB();
const listeners = new Set();

const saveMockDB = () => {
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(mockDatabase));
  } catch {
    // ignore quota errors
  }
  notifyListeners();
};

const saveConfig = () => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(apiConfig));
  } catch {
    // ignore
  }
  notifyListeners();
};

const notifyListeners = () => {
  listeners.forEach((fn) => fn({ ...apiConfig, db: mockDatabase }));
};

export const subscribeToApi = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const getApiConfig = () => ({ ...apiConfig });

export const resetMockData = () => {
  mockDatabase = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
  saveMockDB();
  return mockDatabase;
};

export const getMockDatabaseSnapshot = () => JSON.parse(JSON.stringify(mockDatabase));

/**
 * Generates an ID for a new record in demo mode based on schema prefix.
 */
function nextMockId(schema) {
  const resource = schema.key || schema.resource;
  const list = mockDatabase[resource] || [];
  const nextNum = list.length + 1;
  return `${schema.prefix || 'ID'}${String(nextNum).padStart(3, '0')}`;
}

/**
 * Builds URL identifier for record (handles single and composite primary keys)
 */
function idPathFor(schema, row) {
  if (schema.pkFields) {
    return schema.pkFields.map((f) => encodeURIComponent(row[f])).join('/');
  }
  return encodeURIComponent(row[schema.pk]);
}

/**
 * Finds index of record in demo database
 */
function mockIndexOf(schema, keyRow) {
  const resource = schema.key || schema.resource;
  const arr = mockDatabase[resource] || [];
  if (schema.pkFields) {
    return arr.findIndex((r) =>
      schema.pkFields.every((f) => String(r[f]) === String(keyRow[f]))
    );
  }
  return arr.findIndex((r) => String(r[schema.pk]) === String(keyRow[schema.pk]));
}

// ==========================================
// CORE API METHODS
// ==========================================

export async function apiList(schema) {
  const resource = schema.resource || schema.key;
  if (apiConfig.mode === 'live') {
    const res = await fetch(`${apiConfig.baseUrl}/${resource}`);
    if (!res.ok) throw new Error(`GET /${resource} returned HTTP ${res.status}`);
    return await res.json();
  }
  // Demo Mode
  const data = mockDatabase[schema.key] || mockDatabase[resource] || [];
  return JSON.parse(JSON.stringify(data));
}

export async function apiCreate(schema, payload) {
  const resource = schema.resource || schema.key;
  if (apiConfig.mode === 'live') {
    const res = await fetch(`${apiConfig.baseUrl}/${resource}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`POST /${resource} returned HTTP ${res.status}`);
    return await res.json();
  }

  // Demo Mode
  const row = { ...payload };
  const targetKey = schema.key;
  if (!mockDatabase[targetKey]) mockDatabase[targetKey] = [];

  if (schema.prefix && schema.pk && !row[schema.pk]) {
    row[schema.pk] = nextMockId(schema);
  }
  mockDatabase[targetKey].push(row);
  saveMockDB();
  return { ...row };
}

export async function apiUpdate(schema, keyRow, payload) {
  const resource = schema.resource || schema.key;
  if (apiConfig.mode === 'live') {
    const path = idPathFor(schema, keyRow);
    const res = await fetch(`${apiConfig.baseUrl}/${resource}/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`PUT /${resource}/${path} returned HTTP ${res.status}`);
    return await res.json();
  }

  // Demo Mode
  const targetKey = schema.key;
  const idx = mockIndexOf(schema, keyRow);
  if (idx < 0) throw new Error(`Record not found in ${schema.label}`);
  mockDatabase[targetKey][idx] = { ...mockDatabase[targetKey][idx], ...payload };
  saveMockDB();
  return { ...mockDatabase[targetKey][idx] };
}

export async function apiDelete(schema, keyRow) {
  const resource = schema.resource || schema.key;
  if (apiConfig.mode === 'live') {
    const path = idPathFor(schema, keyRow);
    const res = await fetch(`${apiConfig.baseUrl}/${resource}/${path}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`DELETE /${resource}/${path} returned HTTP ${res.status}`);
    return true;
  }

  // Demo Mode
  const targetKey = schema.key;
  const idx = mockIndexOf(schema, keyRow);
  if (idx < 0) throw new Error(`Record not found in ${schema.label}`);
  mockDatabase[targetKey].splice(idx, 1);
  saveMockDB();
  return true;
}

export async function apiRunSQL(sql) {
  if (apiConfig.mode === 'live') {
    const res = await fetch(`${apiConfig.baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`POST /query returned HTTP ${res.status}: ${errText}`);
    }
    return await res.json(); // Expected: { columns: [...], rows: [[...]] }
  }

  // Demo Mode
  return runDemoQuery(sql, mockDatabase);
}

export async function tryConnect(url) {
  const cleanUrl = url.replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${cleanUrl}/users`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Server responded with HTTP ${res.status}`);

    apiConfig.baseUrl = cleanUrl;
    apiConfig.mode = 'live';
    saveConfig();
    return { success: true, mode: 'live', message: `Connected to live backend at ${cleanUrl}` };
  } catch (err) {
    return {
      success: false,
      mode: 'demo',
      message: `Could not reach ${cleanUrl} (${err.message}). Staying in Demo Mode.`,
    };
  }
}

export function disconnect() {
  apiConfig.mode = 'demo';
  saveConfig();
  return { success: true, mode: 'demo', message: 'Switched to Demo Mode (using local database)' };
}
