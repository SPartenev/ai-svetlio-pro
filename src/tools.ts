/**
 * Svet_AI - Tools Module v1.2.0
 *
 * Управлява каталога с инструменти и MCP Registry интеграция
 * - Вграден каталог с проверени инструменти
 * - Интеграция с официалния MCP Registry (16,000+ сървъра)
 * - Добавяне/премахване на инструменти към проект
 * - Генериране на MCP конфигурация
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import * as yaml from 'yaml';

// MCP Registry API
const MCP_REGISTRY_API = 'https://registry.modelcontextprotocol.io/v0.1/servers';

export class Tools {
  private registryPath: string;
  private registry: any;
  private projectToolsPath: string;

  constructor(projectDir?: string) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~';
    this.registryPath = path.join(homeDir, '.svet-ai', 'registry.yaml');
    this.projectToolsPath = projectDir
      ? path.join(projectDir, '.memory', 'TOOLS.md')
      : path.join(process.cwd(), '.memory', 'TOOLS.md');
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

  // =========================================================================
  // LIST - Показва каталога
  // =========================================================================
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
        console.log(`   ${trust} ${chalk.bold(tool.name)} ${chalk.gray(`(${toolId})`)}`);
        console.log(chalk.gray(`      ${tool.description}`));
      }
    }

    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.gray('\n● Високо доверие  ● Средно доверие  ● Ниско доверие'));
    console.log(chalk.gray('\nКоманди:'));
    console.log(chalk.gray('  svet tools add <id>      Добави инструмент към проекта'));
    console.log(chalk.gray('  svet tools info <id>     Покажи детайли за инструмент'));
    console.log(chalk.gray('  svet tools remove <id>   Премахни от проекта'));
    console.log(chalk.gray('  svet registry search <q> Търси в MCP Registry (16,000+ сървъра)\n'));
  }

  // =========================================================================
  // INFO - Детайлна информация за инструмент
  // =========================================================================
  async info(toolId: string): Promise<void> {
    await this.loadRegistry();
    const tool = this.registry.tools?.[toolId];

    if (!tool) {
      console.log(chalk.red(`\n❌ Инструментът "${toolId}" не е намерен в каталога.`));
      console.log(chalk.gray('Използвай: svet tools за списък с налични инструменти'));
      console.log(chalk.gray('Или: svet registry search <query> за търсене в MCP Registry\n'));
      return;
    }

    const trust = tool.trustLevel === 'high' ? chalk.green('● Високо доверие') :
                  tool.trustLevel === 'medium' ? chalk.yellow('● Средно доверие') : chalk.red('● Ниско доверие');

    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold(`\n📦 ${tool.name}`));
    console.log(chalk.gray(`ID: ${toolId}`));
    console.log(`${trust}`);
    console.log(chalk.gray(`\n${tool.description}\n`));

    if (tool.install) {
      console.log(chalk.yellow('📥 Инсталация:'));
      console.log(chalk.white(`   ${tool.install}\n`));
    }

    if (tool.docs) {
      console.log(chalk.yellow('📚 Документация:'));
      console.log(chalk.blue(`   ${tool.docs}\n`));
    }

    if (tool.source) {
      console.log(chalk.yellow('🔗 Източник:'));
      console.log(chalk.blue(`   ${tool.source}\n`));
    }

    if (tool.language) {
      console.log(chalk.yellow('💻 Език:'));
      console.log(chalk.white(`   ${tool.language}\n`));
    }

    if (tool.mcpConfig) {
      console.log(chalk.yellow('⚙️ MCP Конфигурация:'));
      console.log(chalk.gray(JSON.stringify(tool.mcpConfig, null, 2)));
      console.log();
    }

    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.gray(`\nДобави към проекта: svet tools add ${toolId}\n`));
  }

  // =========================================================================
  // ADD - Добавя инструмент към проекта
  // =========================================================================
  async add(toolId: string): Promise<boolean> {
    await this.loadRegistry();
    const tool = this.registry.tools?.[toolId];

    if (!tool) {
      console.log(chalk.red(`\n❌ Инструментът "${toolId}" не е намерен.`));
      return false;
    }

    // Провери дали .memory/ съществува
    const memoryDir = path.dirname(this.projectToolsPath);
    if (!await fs.pathExists(memoryDir)) {
      console.log(chalk.red('\n❌ Проектът не е инициализиран с Svet_AI.'));
      console.log(chalk.gray('Изпълни: svet init\n'));
      return false;
    }

    // Прочети текущия TOOLS.md
    let toolsContent = '';
    if (await fs.pathExists(this.projectToolsPath)) {
      toolsContent = await fs.readFile(this.projectToolsPath, 'utf-8');
    }

    // Провери дали вече е добавен
    if (toolsContent.includes(`- **${toolId}**`) || toolsContent.includes(`[${toolId}]`)) {
      console.log(chalk.yellow(`\n⚠️ "${tool.name}" вече е добавен към проекта.`));
      return false;
    }

    // Добави инструмента
    const timestamp = new Date().toISOString().split('T')[0];
    const newEntry = `
### ${tool.name}
- **ID:** ${toolId}
- **Категория:** ${tool.category}
- **Описание:** ${tool.description}
- **Инсталация:** \`${tool.install || 'Виж документацията'}\`
- **Добавен:** ${timestamp}
${tool.docs ? `- **Документация:** ${tool.docs}` : ''}
`;

    // Ако файлът е празен или с шаблонно съдържание, пренапиши го
    if (!toolsContent || toolsContent.includes('Няма избрани инструменти')) {
      toolsContent = `# Инструменти на проекта

## Активни инструменти
${newEntry}

---
*Използвай \`svet tools\` за пълен каталог*
*Използвай \`svet tools add <id>\` за добавяне*
`;
    } else {
      // Добави към съществуващия списък
      const insertPoint = toolsContent.indexOf('## Активни инструменти');
      if (insertPoint !== -1) {
        const afterHeader = toolsContent.indexOf('\n', insertPoint) + 1;
        toolsContent = toolsContent.slice(0, afterHeader) + newEntry + toolsContent.slice(afterHeader);
      } else {
        toolsContent += `\n## Активни инструменти\n${newEntry}`;
      }
    }

    await fs.writeFile(this.projectToolsPath, toolsContent);

    console.log(chalk.green(`\n✅ "${tool.name}" е добавен към проекта!`));
    console.log(chalk.gray(`   Записано в: .memory/TOOLS.md`));

    // Покажи инструкции за инсталация
    if (tool.install) {
      console.log(chalk.yellow('\n📥 Следваща стъпка - инсталирай:'));
      console.log(chalk.white(`   ${tool.install}`));
    }

    // Ако е MCP сървър, покажи как да го конфигурира
    if (tool.category === 'mcp' || tool.category === 'mcp-official') {
      console.log(chalk.yellow('\n⚙️ За Claude Desktop, добави в claude_desktop_config.json:'));
      const mcpConfig = tool.mcpConfig || generateMCPConfig(toolId, tool);
      console.log(chalk.gray(JSON.stringify(mcpConfig, null, 2)));
    }

    console.log();
    return true;
  }

  // =========================================================================
  // REMOVE - Премахва инструмент от проекта
  // =========================================================================
  async remove(toolId: string): Promise<boolean> {
    if (!await fs.pathExists(this.projectToolsPath)) {
      console.log(chalk.red('\n❌ Няма .memory/TOOLS.md файл.'));
      return false;
    }

    let toolsContent = await fs.readFile(this.projectToolsPath, 'utf-8');

    // Намери и премахни секцията за инструмента
    const regex = new RegExp(`### [^\\n]*\\n[^#]*\\*\\*ID:\\*\\* ${toolId}[^#]*(?=###|---|\$)`, 'g');
    const newContent = toolsContent.replace(regex, '');

    if (newContent === toolsContent) {
      console.log(chalk.yellow(`\n⚠️ "${toolId}" не е намерен в проекта.`));
      return false;
    }

    await fs.writeFile(this.projectToolsPath, newContent);
    console.log(chalk.green(`\n✅ "${toolId}" е премахнат от проекта.`));
    return true;
  }

  // =========================================================================
  // SEARCH - Търси в локалния каталог
  // =========================================================================
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

  // =========================================================================
  // SEARCH REGISTRY - Търси в официалния MCP Registry
  // =========================================================================
  async searchRegistry(query: string): Promise<void> {
    console.log(chalk.cyan(`\n🔍 Търсене в MCP Registry за "${query}"...\n`));

    try {
      // Динамичен import на fetch
      const fetchModule = await import('node-fetch');
      const fetch = fetchModule.default;

      const response = await fetch(`${MCP_REGISTRY_API}?search=${encodeURIComponent(query)}&limit=20`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as any;
      const servers = data.servers || data || [];

      if (servers.length === 0) {
        console.log(chalk.yellow('Няма намерени резултати.'));
        console.log(chalk.gray('Опитай с други ключови думи или провери: https://registry.modelcontextprotocol.io\n'));
        return;
      }

      console.log(chalk.green(`Намерени ${servers.length} MCP сървъра:\n`));

      for (const server of servers.slice(0, 15)) {
        console.log(chalk.bold(`📦 ${server.name || server.id}`));
        console.log(chalk.gray(`   ${server.description || 'Няма описание'}`));
        if (server.repository) {
          console.log(chalk.blue(`   ${server.repository}`));
        }
        console.log();
      }

      if (servers.length > 15) {
        console.log(chalk.gray(`... и още ${servers.length - 15} резултата`));
      }

      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.gray('Пълен списък: https://registry.modelcontextprotocol.io\n'));

    } catch (error: any) {
      console.log(chalk.yellow('\n⚠️ Не може да се свърже с MCP Registry.'));
      console.log(chalk.gray('Провери интернет връзката или посети директно:'));
      console.log(chalk.blue('https://registry.modelcontextprotocol.io\n'));

      // Покажи локални резултати като fallback
      const localResults = await this.search(query);
      if (localResults.length > 0) {
        console.log(chalk.green('Локални резултати от вградения каталог:\n'));
        for (const tool of localResults) {
          console.log(chalk.bold(`📦 ${tool.name} (${tool.id})`));
          console.log(chalk.gray(`   ${tool.description}\n`));
        }
      }
    }
  }

  // =========================================================================
  // GET TOOL INFO
  // =========================================================================
  async getToolInfo(toolId: string): Promise<any> {
    await this.loadRegistry();
    return this.registry.tools?.[toolId] || null;
  }

  // =========================================================================
  // GET PROJECT TOOLS - Връща инструментите на проекта
  // =========================================================================
  async getProjectTools(): Promise<string[]> {
    if (!await fs.pathExists(this.projectToolsPath)) {
      return [];
    }

    const content = await fs.readFile(this.projectToolsPath, 'utf-8');
    const matches = content.match(/\*\*ID:\*\* ([^\n]+)/g) || [];
    return matches.map(m => m.replace('**ID:** ', '').trim());
  }
}

// =========================================================================
// HELPER: Генерира MCP конфигурация
// =========================================================================
function generateMCPConfig(toolId: string, tool: any): any {
  const baseConfig: any = {
    [toolId]: {
      command: 'npx',
      args: [tool.install?.replace('npx ', '') || toolId]
    }
  };

  // Добави environment variables ако има
  if (tool.envVars) {
    baseConfig[toolId].env = {};
    for (const envVar of tool.envVars) {
      baseConfig[toolId].env[envVar] = `<YOUR_${envVar}>`;
    }
  }

  return baseConfig;
}

// ==========================================================================
// BUILT-IN REGISTRY - Разширен с официални MCP сървъри
// ==========================================================================
function getBuiltInRegistry() {
  return {
    categories: {
      'mcp-official': {
        name: 'Official MCP Servers',
        description: 'Официални MCP сървъри от Anthropic/Linux Foundation',
        icon: '🏛️'
      },
      'mcp-popular': {
        name: 'Popular MCP Servers',
        description: 'Популярни MCP сървъри за бази данни, APIs, автоматизация',
        icon: '⭐'
      },
      'mcp-creators': {
        name: 'MCP Server Creators',
        description: 'Инструменти за СЪЗДАВАНЕ на MCP сървъри',
        icon: '🏭'
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
      // =====================================================================
      // OFFICIAL MCP SERVERS (от Anthropic/Linux Foundation)
      // =====================================================================
      'mcp-filesystem': {
        name: 'MCP Filesystem',
        category: 'mcp-official',
        description: 'Сигурни файлови операции с контрол на достъпа',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-filesystem',
        docs: 'https://github.com/modelcontextprotocol/servers',
        mcpConfig: {
          filesystem: {
            command: 'npx',
            args: ['@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir']
          }
        }
      },
      'mcp-git': {
        name: 'MCP Git',
        category: 'mcp-official',
        description: 'Git операции - четене, търсене, манипулация на repositories',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-git',
        docs: 'https://github.com/modelcontextprotocol/servers'
      },
      'mcp-fetch': {
        name: 'MCP Fetch',
        category: 'mcp-official',
        description: 'Web съдържание за LLM - fetch и конвертиране',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-fetch',
        docs: 'https://github.com/modelcontextprotocol/servers'
      },
      'mcp-memory': {
        name: 'MCP Memory',
        category: 'mcp-official',
        description: 'Persistent memory с knowledge graph',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-memory',
        docs: 'https://github.com/modelcontextprotocol/servers'
      },
      'mcp-sequential-thinking': {
        name: 'MCP Sequential Thinking',
        category: 'mcp-official',
        description: 'Стъпка по стъпка reasoning за сложни проблеми',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-sequential-thinking',
        docs: 'https://github.com/modelcontextprotocol/servers'
      },
      'mcp-time': {
        name: 'MCP Time',
        category: 'mcp-official',
        description: 'Време и часови зони',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-time',
        docs: 'https://github.com/modelcontextprotocol/servers'
      },

      // =====================================================================
      // POPULAR MCP SERVERS
      // =====================================================================
      'mcp-github': {
        name: 'MCP GitHub',
        category: 'mcp-popular',
        description: 'GitHub интеграция - repos, issues, PRs, code search',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-github',
        envVars: ['GITHUB_TOKEN']
      },
      'mcp-postgres': {
        name: 'MCP PostgreSQL',
        category: 'mcp-popular',
        description: 'PostgreSQL операции - заявки, схема, данни',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-postgres',
        envVars: ['DATABASE_URL']
      },
      'mcp-sqlite': {
        name: 'MCP SQLite',
        category: 'mcp-popular',
        description: 'SQLite база данни - заявки, CRUD операции',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-sqlite'
      },
      'mcp-notion': {
        name: 'MCP Notion',
        category: 'mcp-popular',
        description: 'Notion интеграция - страници, бази, съдържание',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-notion',
        envVars: ['NOTION_API_KEY']
      },
      'mcp-slack': {
        name: 'MCP Slack',
        category: 'mcp-popular',
        description: 'Slack интеграция - канали, съобщения, потребители',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-slack',
        envVars: ['SLACK_BOT_TOKEN']
      },
      'mcp-google-drive': {
        name: 'MCP Google Drive',
        category: 'mcp-popular',
        description: 'Google Drive - файлове, папки, споделяне',
        trustLevel: 'high',
        install: 'npx @modelcontextprotocol/server-gdrive',
        envVars: ['GOOGLE_APPLICATION_CREDENTIALS']
      },
      'mcp-brave-search': {
        name: 'MCP Brave Search',
        category: 'mcp-popular',
        description: 'Brave Search API - web търсене с AI summarization',
        trustLevel: 'high',
        install: 'npx @anthropics/mcp-server-brave-search',
        envVars: ['BRAVE_API_KEY']
      },
      'mcp-puppeteer': {
        name: 'MCP Puppeteer',
        category: 'mcp-popular',
        description: 'Browser automation - screenshots, scraping, testing',
        trustLevel: 'medium',
        install: 'npx @anthropics/mcp-server-puppeteer'
      },
      'mcp-airtable': {
        name: 'MCP Airtable',
        category: 'mcp-popular',
        description: 'Airtable интеграция - бази, записи, views',
        trustLevel: 'medium',
        install: 'npx mcp-server-airtable',
        envVars: ['AIRTABLE_API_KEY']
      },
      'mcp-supabase': {
        name: 'MCP Supabase',
        category: 'mcp-popular',
        description: 'Supabase интеграция - PostgreSQL, Auth, Storage',
        trustLevel: 'medium',
        install: 'npx mcp-server-supabase',
        envVars: ['SUPABASE_URL', 'SUPABASE_KEY']
      },

      // =====================================================================
      // MCP CREATORS
      // =====================================================================
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

      // =====================================================================
      // AGENT FRAMEWORKS
      // =====================================================================
      'crewai': {
        name: 'CrewAI',
        category: 'agents',
        description: 'Multi-agent framework с роли (32k+ GitHub stars)',
        trustLevel: 'high',
        install: 'pip install crewai',
        docs: 'https://docs.crewai.com/'
      },
      'langchain': {
        name: 'LangChain',
        category: 'agents',
        description: 'Comprehensive LLM framework за RAG и workflows',
        trustLevel: 'high',
        install: 'pip install langchain langgraph',
        docs: 'https://python.langchain.com/'
      },
      'autogen': {
        name: 'AutoGen',
        category: 'agents',
        description: 'Microsoft enterprise-grade multi-agent framework',
        trustLevel: 'high',
        install: 'pip install autogen',
        docs: 'https://microsoft.github.io/autogen/'
      },

      // =====================================================================
      // SKILLS & RULES
      // =====================================================================
      'antigravity-awesome-skills': {
        name: 'Antigravity Awesome Skills',
        category: 'skills',
        description: '625+ agentic skills за Cursor/Claude Code/Antigravity',
        trustLevel: 'medium',
        install: 'npx antigravity-awesome-skills --cursor',
        source: 'https://github.com/anthropics/antigravity-awesome-skills'
      },
      'awesome-cursorrules': {
        name: 'awesome-cursorrules',
        category: 'skills',
        description: 'Най-голямата колекция от .cursorrules файлове',
        trustLevel: 'medium',
        source: 'https://github.com/PatrickJS/awesome-cursorrules'
      },

      // =====================================================================
      // CLI TOOLS
      // =====================================================================
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
