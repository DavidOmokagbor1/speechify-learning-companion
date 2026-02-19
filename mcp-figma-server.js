#!/usr/bin/env node

/**
 * Figma MCP Server for Speechify
 * Connects to Figma API and provides MCP interface
 */

import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.MCP_PORT || 3000;
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_TOKEN) {
  console.error('❌ Error: FIGMA_TOKEN environment variable not set');
  console.log('Please set: export FIGMA_TOKEN="your_figma_token"');
  process.exit(1);
}

console.log('🎨 Figma MCP Server Starting...');
console.log(`📍 Server will run on http://localhost:${PORT}`);

// Simple HTTP server for MCP
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    // Health check
    if (pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', service: 'Figma MCP Server' }));
      return;
    }

    // Version endpoint
    if (pathname === '/version') {
      res.writeHead(200);
      res.end(JSON.stringify({ version: '1.0.0', mcp: true }));
      return;
    }

    // Figma file info
    if (pathname.startsWith('/figma/file/')) {
      const fileId = pathname.split('/')[3];
      
      if (!fileId) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'File ID required' }));
        return;
      }

      const figmaUrl = `https://api.figma.com/v1/files/${fileId}`;
      const response = await fetch(figmaUrl, {
        headers: {
          'X-FIGMA-TOKEN': FIGMA_TOKEN,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Figma API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, data }));
      return;
    }

    // List components
    if (pathname.startsWith('/figma/components')) {
      if (!FIGMA_FILE_ID) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'FIGMA_FILE_ID not set' }));
        return;
      }

      const url = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}/components`;
      const response = await fetch(url, {
        headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN }
      });

      const data = await response.json();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, components: data.components }));
      return;
    }

    // Export node
    if (pathname.startsWith('/figma/export')) {
      const params = new URLSearchParams(url.search);
      const fileId = params.get('fileId') || FIGMA_FILE_ID;
      const nodeIds = params.get('nodeIds');
      const format = params.get('format') || 'svg';

      if (!fileId || !nodeIds) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'fileId and nodeIds required' }));
        return;
      }

      const exportUrl = `https://api.figma.com/v1/files/${fileId}/export?ids=${nodeIds}&format=${format}`;
      const response = await fetch(exportUrl, {
        headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN }
      });

      const data = await response.json();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, exports: data.exports }));
      return;
    }

    // Default 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));

  } catch (error) {
    console.error('🚨 Error:', error.message);
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Figma MCP Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log(`  GET /health - Server health check`);
  console.log(`  GET /version - Server version`);
  console.log(`  GET /figma/file/:fileId - Get Figma file info`);
  console.log(`  GET /figma/components - List components`);
  console.log(`  GET /figma/export?fileId=ID&nodeIds=NODE_IDS - Export nodes`);
  console.log('');
  console.log('💡 Example:');
  console.log(`  curl http://localhost:${PORT}/figma/file/YOUR_FILE_ID`);
  console.log('');
  console.log('Press Ctrl+C to stop server');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('Try: export MCP_PORT=3001');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Figma MCP Server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
