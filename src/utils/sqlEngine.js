/**
 * WAVELENGTH — CLIENT-SIDE SQL ENGINE (DEMO MODE)
 * Provides execution for single-table queries and precomputed join results
 * for template queries, strictly conforming to { columns, rows } format.
 */

import { SCHEMA } from '../data/schema.js';


export const QUICK_QUERIES = [
  {
    id: 'premium_users',
    title: 'All Premium Users',
    category: 'JOIN & Filter',
    description: 'Finds user profiles active on the Premium subscription tier.',
    sql: `SELECT u.User_ID, u.First_Name, u.Last_Name, u.Email, s.Plan_Type, s.Start_Date
FROM Users u
JOIN Subscription s ON u.User_ID = s.User_ID
WHERE s.Plan_Type = 'Premium';`,
    execute: (db) => {
      const premiumSubs = db.subscriptions.filter((s) => s.Plan_Type === 'Premium');
      const rows = premiumSubs.map((s) => {
        const u = db.users.find((user) => user.User_ID === s.User_ID) || {};
        return [u.User_ID, u.First_Name, u.Last_Name, u.Email, s.Plan_Type, s.Start_Date];
      });
      return {
        columns: ['User_ID', 'First_Name', 'Last_Name', 'Email', 'Plan_Type', 'Start_Date'],
        rows,
      };
    },
  },
  {
    id: 'long_songs',
    title: 'Songs > 3:30 Duration',
    category: 'Filter & Order',
    description: 'Identifies extended tracks exceeding 210 seconds, sorted descending.',
    sql: `SELECT Song_ID, Title, Duration, Language, Release_Date
FROM Song
WHERE Duration > 210
ORDER BY Duration DESC;`,
    execute: (db) => {
      const matching = db.songs
        .filter((s) => Number(s.Duration) > 210)
        .sort((a, b) => Number(b.Duration) - Number(a.Duration));
      return {
        columns: ['Song_ID', 'Title', 'Duration', 'Language', 'Release_Date'],
        rows: matching.map((s) => [s.Song_ID, s.Title, s.Duration, s.Language, s.Release_Date]),
      };
    },
  },
  {
    id: 'revenue_by_mode',
    title: 'Revenue by Payment Mode',
    category: 'Aggregation & GROUP BY',
    description: 'Summarizes total transactions and financial volume per gateway.',
    sql: `SELECT Mode, COUNT(Payment_ID) AS Total_Payments, SUM(Amount) AS Total_Revenue
FROM Payment
GROUP BY Mode
ORDER BY Total_Revenue DESC;`,
    execute: (db) => {
      const modeMap = {};
      db.payments.forEach((p) => {
        const m = p.Mode || 'Unknown';
        if (!modeMap[m]) modeMap[m] = { count: 0, sum: 0 };
        modeMap[m].count += 1;
        modeMap[m].sum += Number(p.Amount || 0);
      });
      const rows = Object.entries(modeMap)
        .sort((a, b) => b[1].sum - a[1].sum)
        .map(([m, data]) => [m, data.count, `₹${data.sum.toFixed(2)}`]);
      return {
        columns: ['Mode', 'Total_Payments', 'Total_Revenue'],
        rows,
      };
    },
  },
  {
    id: 'episodes_per_podcast',
    title: 'Episodes per Podcast',
    category: 'LEFT JOIN & Count',
    description: 'Calculates the volume of catalogue releases linked to each show.',
    sql: `SELECT p.Podcast_ID, p.Podcast_Title, p.Language, COUNT(e.Episode_No) AS Episode_Count
FROM Podcast p
LEFT JOIN Episode e ON p.Podcast_ID = e.Podcast_ID
GROUP BY p.Podcast_ID, p.Podcast_Title;`,
    execute: (db) => {
      const rows = db.podcasts.map((p) => {
        const epCount = db.episodes.filter((e) => e.Podcast_ID === p.Podcast_ID).length;
        return [p.Podcast_ID, p.Podcast_Title, p.Language, epCount];
      });
      return {
        columns: ['Podcast_ID', 'Podcast_Title', 'Language', 'Episode_Count'],
        rows,
      };
    },
  },
  {
    id: 'songs_with_details',
    title: 'Songs with Artist & Album',
    category: '3-Table Relational JOIN',
    description: 'Resolves foreign keys from Songs through Albums to root Artists.',
    sql: `SELECT s.Song_ID, s.Title AS Song_Title, s.Duration, al.Title AS Album_Title, ar.Name AS Artist_Name
FROM Song s
JOIN Album al ON s.Album_ID = al.Album_ID
JOIN Artist ar ON al.Artist_ID = ar.Artist_ID;`,
    execute: (db) => {
      const rows = db.songs.map((s) => {
        const album = db.albums.find((al) => al.Album_ID === s.Album_ID) || {};
        const artist = db.artists.find((ar) => ar.Artist_ID === album.Artist_ID) || {};
        return [s.Song_ID, s.Title, s.Duration, album.Title || '—', artist.Name || '—'];
      });
      return {
        columns: ['Song_ID', 'Song_Title', 'Duration', 'Album_Title', 'Artist_Name'],
        rows,
      };
    },
  },
];

/**
 * Executes an arbitrary SQL string in demo mode
 */
export const runDemoQuery = (sql, db) => {
  const cleanSql = sql.trim().replace(/;+$/, '');
  
  // 1. Check if matches precomputed template
  const matchedTemplate = QUICK_QUERIES.find(
    (q) => q.sql.trim().replace(/;+$/, '').toLowerCase() === cleanSql.toLowerCase()
  );
  if (matchedTemplate) {
    return matchedTemplate.execute(db);
  }

  // 2. Simple single-table parser: SELECT ... FROM ... [WHERE ...] [ORDER BY ...] [LIMIT ...]
  const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i;
  const match = cleanSql.match(selectRegex);

  if (!match) {
    throw new Error(
      `Demo Mode supports quick join templates or single-table queries:\nSELECT <cols|*> FROM <Table> [WHERE col = 'value'] [ORDER BY col [ASC|DESC]] [LIMIT n]\n\nConnect to Live Mode to execute arbitrary backend DBMS queries.`
    );
  }

  const [, colsRaw, tableName, whereRaw, orderCol, orderDir, limitRaw] = match;
  
  // Find schema by SQL table name or resource name
  const schema = SCHEMA.find(
    (s) =>
      s.sqlTable.toLowerCase() === tableName.toLowerCase() ||
      s.key.toLowerCase() === tableName.toLowerCase() ||
      s.resource.toLowerCase() === tableName.toLowerCase()
  );

  if (!schema) {
    const validTables = SCHEMA.map((s) => s.sqlTable).join(', ');
    throw new Error(`Unknown table "${tableName}". Available tables in schema: ${validTables}`);
  }

  const resourceKey = schema.key;
  let rows = [...(db[resourceKey] || [])];

  // Apply WHERE condition if present
  if (whereRaw) {
    const whereMatch = whereRaw.trim().match(/^([a-zA-Z0-9_]+)\s*(=|!=|>=|<=|>|<)\s*'?([^']+?)'?$/);
    if (!whereMatch) {
      throw new Error(`Demo Mode WHERE clause supports single expressions: col = 'value'`);
    }
    const [, col, op, rawVal] = whereMatch;
    const targetVal = isNaN(rawVal) ? rawVal : Number(rawVal);

    rows = rows.filter((r) => {
      const itemVal = isNaN(r[col]) ? r[col] : Number(r[col]);
      if (op === '=') return String(itemVal).toLowerCase() === String(targetVal).toLowerCase();
      if (op === '!=') return String(itemVal).toLowerCase() !== String(targetVal).toLowerCase();
      if (op === '>') return itemVal > targetVal;
      if (op === '<') return itemVal < targetVal;
      if (op === '>=') return itemVal >= targetVal;
      if (op === '<=') return itemVal <= targetVal;
      return true;
    });
  }

  // Apply ORDER BY
  if (orderCol) {
    const isDesc = orderDir && orderDir.toUpperCase() === 'DESC';
    rows.sort((a, b) => {
      const valA = a[orderCol] ?? '';
      const valB = b[orderCol] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }
      return isDesc
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB));
    });
  }

  // Apply LIMIT
  if (limitRaw) {
    rows = rows.slice(0, parseInt(limitRaw, 10));
  }

  // Determine Columns
  const columns =
    colsRaw.trim() === '*'
      ? schema.columns.map((c) => c.name)
      : colsRaw.split(',').map((c) => c.trim());

  return {
    columns,
    rows: rows.map((r) => columns.map((colName) => r[colName] ?? null)),
  };
};
