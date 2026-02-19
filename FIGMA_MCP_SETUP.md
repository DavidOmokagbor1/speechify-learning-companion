# Figma MCP Integration Guide for Speechify

## Overview
This guide helps you integrate Figma MCP (Model Context Protocol) into your Speechify project for seamless design-to-code workflow.

## Prerequisites
- Node.js 24.x (already installed)
- npm 10.x (already installed)
- Figma account with API access
- Figma design file URL

## Step 1: Install Figma MCP Package

```bash
npm install @modelcontextprotocol/server-figma --save-dev
```

## Step 2: Get Figma API Token

1. Go to [Figma Settings](https://www.figma.com/settings)
2. Navigate to **Personal Access Tokens**
3. Create a new token with name: `Speechify MCP Token`
4. Copy the token (keep it secret!)

## Step 3: Set Environment Variables

Create `.env.local` file in project root:

```bash
FIGMA_TOKEN=your_figma_api_token_here
```

Or add to `.env`:

```env
FIGMA_TOKEN=figd_your_token_here
```

## Step 4: Configure MCP Server

The `mcp.config.json` file is already created. Update environment variable:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-figma",
        "--token",
        "${FIGMA_TOKEN}"
      ]
    }
  }
}
```

## Step 5: Add MCP Scripts to package.json

Already added:
- `npm run mcp:figma` - Start Figma MCP server

## Step 6: Connect Figma File

Get your Figma file ID from URL:
```
https://www.figma.com/file/[FILE_ID]/[FILE_NAME]
```

Use in your MCP commands with file ID.

## Step 7: Use Figma MCP

### Start MCP Server:
```bash
npm run mcp:figma
```

### Example MCP Commands:

**Get File Metadata:**
```bash
curl http://localhost:3000/figma/file/FILE_ID
```

**Export Component:**
```bash
curl http://localhost:3000/figma/file/FILE_ID/nodes/NODE_ID
```

**Generate React Component from Frame:**
```bash
npm run mcp:figma -- export:component "Component Name"
```

## Step 8: Integrate with VS Code

Add to `.vscode/settings.json`:

```json
{
  "figma.token": "${FIGMA_TOKEN}",
  "figma.fileId": "your_figma_file_id"
}
```

Or install Figma extension:
- Search: "Figma for VS Code" in VS Code Extensions
- ID: `figma.figma-vscode-extension`

## Step 9: Auto-Generate React Components

For each Figma component:

1. Create design in Figma (use proper naming convention)
2. Export frame to React component
3. MCP generates code scaffold
4. Customize in React component file

### Naming Convention for Auto-Export:
```
[COMPONENT_TYPE]_ComponentName_[Variant]

Examples:
- BUTTON_Primary_Default
- INPUT_TextInput_Focused
- CARD_ProductCard_Large
```

## Step 10: Connect to Your Project Build

### Option A: Vite Plugin (Recommended)

Add to `vite.config.js`:

```javascript
import react from '@vitejs/plugin-react'
import figmaPlugin from 'vite-plugin-figma-export'

export default {
  plugins: [
    react(),
    figmaPlugin({
      figmaToken: process.env.FIGMA_TOKEN,
      figmaFileId: process.env.FIGMA_FILE_ID,
      outputDir: 'src/components/generated'
    })
  ]
}
```

### Option B: Build Script

Add to `package.json`:

```json
"scripts": {
  "figma:export": "figma-export build",
  "figma:watch": "figma-export watch",
  "build": "npm run figma:export && vite build"
}
```

## Step 11: Speechify-Specific Setup

For Speechify components (AudioPlayer, QuizModal, Dashboard):

1. Create Figma file with components
2. Organize by type:
   - **Audio Controls** frame
   - **Quiz Modal** frame
   - **Dashboard Widgets** frame

3. Export settings:
```json
{
  "outputPath": "src/components",
  "componentFormat": "jsx",
  "includeStories": true,
  "includeTailwind": true
}
```

## Step 12: Example: Auto-Generate AudioPlayer Variant

Figma Component: `BUTTON_PlayPause_Primary`

MCP generates:
```jsx
// src/components/generated/PlayPauseButton.jsx
export const PlayPauseButton = ({ isPlaying, onClick, size = 'md' }) => {
  return (
    <button
      className={`btn-play-pause btn-${size} ${isPlaying ? 'playing' : ''}`}
      onClick={onClick}
    >
      {isPlaying ? <FaPause /> : <FaPlay />}
    </button>
  )
}
```

## Workflow Summary

```
Figma Design
    ↓
MCP Export
    ↓
Generate JSX Component
    ↓
Integrate into Speechify
    ↓
Deploy to Vercel
```

## Troubleshooting

**Error: "FIGMA_TOKEN not found"**
- Check `.env` file exists
- Run: `export FIGMA_TOKEN="your_token"`

**MCP Server won't start**
- Check Node.js version: `node --version` (should be 24.x)
- Reinstall: `npm install @modelcontextprotocol/server-figma --save-dev`

**Components not generating**
- Verify Figma file permissions
- Check component naming convention
- Ensure all layers are properly named

## Next Steps

1. Create Figma file for Speechify UI components
2. Set up MCP token
3. Run `npm run mcp:figma`
4. Export components to React
5. Customize and integrate
6. Deploy with `npm run build`

## Resources

- [Figma Developer Docs](https://www.figma.com/developers)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Figma REST API](https://www.figma.com/developers/api)
- [@modelcontextprotocol/server-figma](https://www.npmjs.com/package/@modelcontextprotocol/server-figma)

## Support

For questions about Figma MCP integration, check:
- Figma MCP GitHub issues
- VS Code Figma Extension documentation
- MCP community resources
