// Simple local network upload server for William's class recordings
// Runs on Mac Mini, listens on port 3400
// William's laptop uploads recordings when on home Wi-Fi

const http = require('http');
const fs = require('fs');
const path = require('path');

const SAVE_DIR = path.join(process.env.HOME, '.openclaw/workspace/william-recordings');
const PORT = 3400;

if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  // CORS headers for browser upload
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: 'william-sync', time: new Date().toISOString() }));
    return;
  }
  
  // Upload recording
  if (req.method === 'POST' && req.url === '/upload') {
    const filename = req.headers['x-filename'] || `recording-${Date.now()}.webm`;
    const filepath = path.join(SAVE_DIR, filename);
    const writeStream = fs.createWriteStream(filepath);
    
    req.pipe(writeStream);
    
    writeStream.on('finish', () => {
      const size = fs.statSync(filepath).size;
      console.log(`[SYNC] Received: ${filename} (${(size/1024/1024).toFixed(1)}MB)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', filename, size }));
    });
    
    writeStream.on('error', (err) => {
      console.error('[SYNC] Error:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ status: 'error', message: err.message }));
    });
    return;
  }
  
  // List recordings
  if (req.method === 'GET' && req.url === '/list') {
    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.webm')).map(f => ({
      name: f,
      size: fs.statSync(path.join(SAVE_DIR, f)).size,
      date: fs.statSync(path.join(SAVE_DIR, f)).mtime
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files));
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SYNC] William recording sync server running on port ${PORT}`);
  console.log(`[SYNC] Saving to: ${SAVE_DIR}`);
  console.log(`[SYNC] Mac Mini IP: check with 'ipconfig getifaddr en0'`);
});
