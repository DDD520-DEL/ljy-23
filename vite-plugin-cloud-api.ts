import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface CloudRecord {
  id: string;
  userId: string;
  [key: string]: unknown;
}

interface CloudUserData {
  records: CloudRecord[];
  lastSyncTime: string | null;
  updatedAt: string;
}

type CloudStore = Record<string, CloudUserData>;

const DATA_FILE = path.resolve(process.cwd(), 'cloud-data.json');

const loadStore = (): CloudStore => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}
  return {};
};

const saveStore = (store: CloudStore) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
};

export function cloudApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-cloud-api',
    configureServer(server) {
      server.middlewares.use('/api/cloud', (req, res, next) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        const pathname = url.pathname;

        const match = pathname.match(/^\/([^/]+)$/);
        if (!match) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: '无效的请求路径' }));
          return;
        }

        const userId = match[1];

        if (req.method === 'GET') {
          const store = loadStore();
          const data = store[userId] || null;
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ data }));
          return;
        }

        if (req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body) as CloudUserData;
              const store = loadStore();
              store[userId] = {
                records: parsed.records || [],
                lastSyncTime: parsed.lastSyncTime || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              saveStore(store);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(JSON.stringify({ data: store[userId] }));
            } catch {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: '无效的请求数据' }));
            }
          });
          return;
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end();
          return;
        }

        next();
      });
    },
  };
}
