/**
 * Vite Plugin for Figma MCP Integration
 * Auto-generates React components from Figma designs
 */

import { promises as fs } from 'fs';
import path from 'path';

export default function vitePluginFigmaMcp(options = {}) {
  const {
    figmaToken = process.env.FIGMA_TOKEN,
    figmaFileId = process.env.FIGMA_FILE_ID,
    outputDir = 'src/components/generated',
    componentFormat = 'jsx',
    includeStories = false,
    includeTailwind = true
  } = options;

  let config;

  return {
    name: 'vite-plugin-figma-mcp',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      if (process.env.FIGMA_EXPORT === 'true') {
        console.log('🎨 Fetching Figma components...');
        try {
          await generateComponentsFromFigma({
            figmaToken,
            figmaFileId,
            outputDir,
            componentFormat,
            includeStories,
            includeTailwind
          });
          console.log('✅ Figma components generated');
        } catch (error) {
          console.error('❌ Figma export failed:', error.message);
          // Don't fail build, just warn
        }
      }
    },

    handleHotUpdate({ file, server, event }) {
      if (file.includes('mcp.config.json')) {
        console.log('🔄 MCP config updated, regenerating components...');
        // Trigger component regeneration
        return;
      }
    }
  };
}

/**
 * Generate React components from Figma file
 */
async function generateComponentsFromFigma(options) {
  const {
    figmaToken,
    figmaFileId,
    outputDir,
    componentFormat,
    includeStories,
    includeTailwind
  } = options;

  if (!figmaToken || !figmaFileId) {
    throw new Error('FIGMA_TOKEN and FIGMA_FILE_ID required');
  }

  // Fetch file from Figma API
  const fileResponse = await fetch(
    `https://api.figma.com/v1/files/${figmaFileId}`,
    {
      headers: { 'X-FIGMA-TOKEN': figmaToken }
    }
  );

  if (!fileResponse.ok) {
    throw new Error(`Figma API error: ${fileResponse.statusText}`);
  }

  const fileData = await fileResponse.json();
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Process components
  const components = extractComponents(fileData);
  
  for (const component of components) {
    const fileName = `${component.name}.${componentFormat}`;
    const filePath = path.join(outputDir, fileName);
    
    const componentCode = generateReactComponent(component, {
      includeTailwind,
      format: componentFormat
    });

    await fs.writeFile(filePath, componentCode);
    console.log(`  ✏️  Generated: ${fileName}`);

    // Generate Storybook stories if requested
    if (includeStories) {
      const storyCode = generateStory(component);
      const storyPath = path.join(outputDir, `${component.name}.stories.${componentFormat}`);
      await fs.writeFile(storyPath, storyCode);
    }
  }
}

/**
 * Extract components from Figma file data
 */
function extractComponents(fileData) {
  const components = [];
  
  // Example extraction logic
  // In production, this would traverse the Figma document tree
  // and extract component definitions
  
  if (fileData.components) {
    Object.entries(fileData.components).forEach(([id, component]) => {
      components.push({
        id,
        name: sanitizeName(component.name),
        description: component.description || '',
        props: extractProps(component)
      });
    });
  }

  return components;
}

/**
 * Generate React component code
 */
function generateReactComponent(component, options) {
  const { includeTailwind, format } = options;
  
  const props = component.props
    .map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`)
    .join(', ');

  const tailwindImport = includeTailwind ? "import './component.css';\n" : '';

  return `${tailwindImport}/**
 * Auto-generated component from Figma
 * Component: ${component.name}
 * Description: ${component.description}
 */

export const ${component.name} = ({ ${props} }) => {
  return (
    <div className="component-${component.name.toLowerCase()}">
      {/* Generated from Figma component */}
      <p>TODO: Implement ${component.name} component</p>
    </div>
  );
};

export default ${component.name};
`;
}

/**
 * Generate Storybook story
 */
function generateStory(component) {
  return `import { ${component.name} } from './${component.name}';

export default {
  title: 'Components/${component.name}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
  },
};

export const Default = {
  args: {
    // Add default props here
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};
`;
}

/**
 * Extract props from Figma component
 */
function extractProps(component) {
  // In production, extract from Figma component properties
  return [
    { name: 'children', type: 'React.ReactNode', required: false },
    { name: 'className', type: 'string', required: false }
  ];
}

/**
 * Sanitize component name for valid JS identifier
 */
function sanitizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/^[0-9]/, '_')
    .replace(/\b(\w)/g, l => l.toUpperCase());
}
