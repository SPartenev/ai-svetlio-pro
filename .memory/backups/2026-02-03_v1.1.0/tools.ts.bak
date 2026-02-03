/**
 * Svet_AI - Tools Module
 * 
 * Управлява каталога с инструменти (registry.yaml)
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import * as yaml from 'yaml';

export class Tools {
  private registryPath: string;
  private registry: any;
  
  constructor() {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~';
    this.registryPath = path.join(homeDir, '.svet-ai', 'registry.yaml');
  }
  
  async loadRegistry(): Promise<void> {
    // Опитай да зареди от глобална директория
    if (await fs.pathExists(this.registryPath)) {
      const content = await fs.readFile(this.registryPath, 'utf-8');
      this.registry = yaml.parse(content);
    } else {
      // Използвай вградения registry
      this.registry = getBuiltInRegistry();
    }
  }
  
  async list(category?: string): Promise<void> {
    await this.loadRegistry();
    
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan('                  🛠️  НАЛИЧНИ ИНСТРУМЕНТИ'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    
    const categories = this.registry.categories || {};
    const tools = this.registry.tools || {};
    
    for (const [catId, catInfo] of Object.entries(categories) as [string, any][]) {
      if (category && catId !== category) continue;
      
      const icon = catInfo.icon || '📦';
      console.log(chalk.yellow(`\n${icon} ${catInfo.name}`));
      console.log(chalk.gray(`   ${catInfo.description}`));
      
      // Намери инструментите в тази категория
      const catTools = Object.entries(tools).filter(([_, t]: [string, any]) => t.category === catId);
      
      for (const [toolId, tool] of catTools as [string, any][]) {
        const trust = tool.trustLevel === 'high' ? chalk.green('●') : 
                      tool.trustLevel === 'medium' ? chalk.yellow('●') : chalk.red('●');
        console.log(`   ${trust} ${chalk.bold(tool.name)}`);
        console.log(chalk.gray(`      ${tool.description}`));
      }
    }
    
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.gray('\n● Високо доверие  ● Средно доверие  ● Ниско доверие'));
    console.log(chalk.gray('Използвай: svet mcp-wizard за създаване на MCP сървър\n'));
  }
  
  async getToolInfo(toolId: string): Promise<any> {
    await this.loadRegistry();
    return this.registry.tools?.[toolId] || null;
  }
  
  async search(query: string): Promise<any[]> {
    await this.loadRegistry();
    const results: any[] = [];
    const q = query.toLowerCase();
    
    for (const [id, tool] of Object.entries(this.registry.tools || {}) as [string, any][]) {
      if (id.includes(q) || 
          tool.name?.toLowerCase().includes(q) ||
          tool.description?.toLowerCase().includes(q)) {
        results.push({ id, ...tool });
      }
    }
    
    return results;
  }
}

// ==========================================================================
// BUILT-IN REGISTRY
// ==========================================================================

function getBuiltInRegistry() {
  return {
    categories: {
      'mcp-creators': {
        name: 'MCP Server Creators',
        description: 'Инструменти за СЪЗДАВАНЕ на MCP сървъри',
        icon: '🏭'
      },
      'mcp': {
        name: 'MCP Servers',
        description: 'Готови MCP сървъри',
        icon: '🔌'
      },
      'agents': {
        name: 'Agent Frameworks',
        description: 'Frameworks за AI агенти',
        icon: '🤖'
      },
      'skills': {
        name: 'Skills & Rules',
        description: 'Skills и правила за IDE',
        icon: '🎯'
      },
      'cli': {
        name: 'CLI Tools',
        description: 'Command-line инструменти',
        icon: '⌨️'
      }
    },
    
    tools: {
      // MCP CREATORS
      'fastmcp': {
        name: 'FastMCP',
        category: 'mcp-creators',
        description: 'Python framework за MCP сървъри. Production-ready, препоръчителен.',
        trustLevel: 'high',
        install: 'pip install fastmcp',
        docs: 'https://gofastmcp.com/',
        language: 'python'
      },
      'generator-mcp': {
        name: 'generator-mcp',
        category: 'mcp-creators',
        description: 'Yeoman generator за Node.js MCP сървъри.',
        trustLevel: 'high',
        install: 'npm install -g yo generator-mcp && yo mcp',
        language: 'nodejs'
      },
      'openapi-to-mcpserver': {
        name: 'openapi-to-mcpserver',
        category: 'mcp-creators',
        description: 'Конвертира OpenAPI spec в MCP сървър. ⚠️ Внимание при употреба.',
        trustLevel: 'medium',
        install: 'npm install -g openapi-to-mcpserver',
        language: 'nodejs'
      },
      
      // MCP SERVERS
      'mcp-github': {
        name: 'MCP GitHub',
        category: 'mcp',
        description: 'GitHub интеграция - repos, issues, PRs, code search',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-github'
      },
      'mcp-postgres': {
        name: 'MCP PostgreSQL',
        category: 'mcp',
        description: 'PostgreSQL операции - заявки, схема, данни',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-postgres'
      },
      'mcp-notion': {
        name: 'MCP Notion',
        category: 'mcp',
        description: 'Notion интеграция - страници, бази, съдържание',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-notion'
      },
      'mcp-firecrawl': {
        name: 'MCP Firecrawl',
        category: 'mcp',
        description: 'Web scraping с JS rendering',
        trustLevel: 'medium',
        install: 'npx @anthropics/mcp-server-firecrawl'
      },
      
      // AGENT FRAMEWORKS
      'crewai': {
        name: 'CrewAI',
        category: 'agents',
        description: 'Multi-agent framework с роли (32k+ GitHub stars)',
        trustLevel: 'high',
        install: 'pip install crewai'
      },
      'langchain': {
        name: 'LangChain',
        category: 'agents',
        description: 'Comprehensive LLM framework за RAG и workflows',
        trustLevel: 'high',
        install: 'pip install langchain langgraph'
      },
      'autogen': {
        name: 'AutoGen',
        category: 'agents',
        description: 'Microsoft enterprise-grade multi-agent framework',
        trustLevel: 'high',
        install: 'pip install autogen'
      },
      
      // SKILLS & RULES
      'antigravity-awesome-skills': {
        name: 'Antigravity Awesome Skills',
        category: 'skills',
        description: '625+ agentic skills за Cursor/Claude Code/Antigravity',
        trustLevel: 'medium',
        install: 'npx antigravity-awesome-skills --cursor'
      },
      'awesome-cursorrules': {
        name: 'awesome-cursorrules',
        category: 'skills',
        description: 'Най-голямата колекция от .cursorrules файлове',
        trustLevel: 'medium',
        source: 'https://github.com/PatrickJS/awesome-cursorrules'
      },
      
      // CLI TOOLS
      'vibe-tools': {
        name: 'vibe-tools',
        category: 'cli',
        description: 'Codebase анализ (Gemini), web търсене (Perplexity)',
        trustLevel: 'medium',
        install: 'npm install -g vibe-tools && vibe-tools install'
      },
      'ralph-loop': {
        name: 'Ralph Loop',
        category: 'cli',
        description: 'Infinite loop с fresh context за автономно кодене',
        trustLevel: 'medium',
        source: 'VS Code Extension: Ralph Loop for Antigravity'
      }
    }
  };
}
