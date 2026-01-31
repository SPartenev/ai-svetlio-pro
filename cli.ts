#!/usr/bin/env node
/**
 * ███████╗██╗   ██╗███████╗████████╗     █████╗ ██╗
 * ██╔════╝██║   ██║██╔════╝╚══██╔══╝    ██╔══██╗██║
 * ███████╗██║   ██║█████╗     ██║       ███████║██║
 * ╚════██║╚██╗ ██╔╝██╔══╝     ██║       ██╔══██║██║
 * ███████║ ╚████╔╝ ███████╗   ██║       ██║  ██║██║
 * ╚══════╝  ╚═══╝  ╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝
 * 
 * Svet_AI - Universal AI Agent Toolkit & Project Memory
 * 
 * Режими:
 *   NORMAL      - Текуща работа
 *   REPAIR      - Поправки с backup и одобрение
 *   ONBOARD     - Вкарване на съществуващ проект
 *   ANALYZE     - Дълбок анализ (EXTEND/REWRITE)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Memory } from './memory';
import { Modes } from './modes';
import { Tools } from './tools';
import { MCPWizard } from './mcp-wizard';

const VERSION = '1.0.0';

// ============================================================================
// BANNER
// ============================================================================

function showBanner() {
  console.log(chalk.cyan(`
  ███████╗██╗   ██╗███████╗████████╗     █████╗ ██╗
  ██╔════╝██║   ██║██╔════╝╚══██╔══╝    ██╔══██╗██║
  ███████╗██║   ██║█████╗     ██║       ███████║██║
  ╚════██║╚██╗ ██╔╝██╔══╝     ██║       ██╔══██║██║
  ███████║ ╚████╔╝ ███████╗   ██║       ██║  ██║██║
  ╚══════╝  ╚═══╝  ╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝
  `));
  console.log(chalk.gray(`  Universal AI Agent Toolkit & Project Memory v${VERSION}\n`));
}

// ============================================================================
// CLI SETUP
// ============================================================================

const program = new Command();

program
  .name('svet')
  .description('Svet_AI - Universal AI Agent Toolkit & Project Memory')
  .version(VERSION);

// ----------------------------------------------------------------------------
// svet setup - Глобална настройка (веднъж)
// ----------------------------------------------------------------------------
program
  .command('setup')
  .description('Глобална настройка на Svet_AI (веднъж на машината)')
  .option('--ide <ide>', 'Специфично IDE (cursor, claude-code, antigravity, all)', 'all')
  .action(async (options) => {
    showBanner();
    console.log(chalk.yellow('🔧 Глобална настройка на Svet_AI\n'));
    
    const homeDir = process.env.HOME || process.env.USERPROFILE || '~';
    const svetDir = path.join(homeDir, '.svet-ai');
    
    // Създай глобална директория
    await fs.ensureDir(svetDir);
    
    // Копирай registry
    const registrySource = path.join(__dirname, '../registry.yaml');
    const registryDest = path.join(svetDir, 'registry.yaml');
    if (await fs.pathExists(registrySource)) {
      await fs.copy(registrySource, registryDest);
    }
    
    // Създай глобални rules за IDE-тата
    if (options.ide === 'all' || options.ide === 'cursor') {
      const cursorRules = path.join(homeDir, '.cursorrules');
      await fs.writeFile(cursorRules, generateGlobalRules('cursor'));
      console.log(chalk.green(`  ✓ Cursor rules: ${cursorRules}`));
    }
    
    if (options.ide === 'all' || options.ide === 'claude-code') {
      const claudeDir = path.join(homeDir, '.claude');
      await fs.ensureDir(claudeDir);
      await fs.writeFile(path.join(claudeDir, 'CLAUDE.md'), generateGlobalRules('claude-code'));
      console.log(chalk.green(`  ✓ Claude Code rules: ${claudeDir}/CLAUDE.md`));
    }
    
    if (options.ide === 'all' || options.ide === 'antigravity') {
      const antigravityDir = path.join(homeDir, '.antigravity');
      await fs.ensureDir(antigravityDir);
      await fs.writeFile(path.join(antigravityDir, 'rules.md'), generateGlobalRules('antigravity'));
      console.log(chalk.green(`  ✓ Antigravity rules: ${antigravityDir}/rules.md`));
    }
    
    console.log(chalk.green('\n✅ Svet_AI е настроен глобално!'));
    console.log(chalk.gray('\nСега можеш да използваш `svet init` във всеки проект.'));
  });

// ----------------------------------------------------------------------------
// svet init - Инициализирай нов проект
// ----------------------------------------------------------------------------
program
  .command('init')
  .description('Инициализирай Svet_AI в текущия проект')
  .option('--name <name>', 'Име на проекта')
  .action(async (options) => {
    showBanner();
    console.log(chalk.yellow('📁 Инициализиране на проект\n'));
    
    const memory = new Memory(process.cwd());
    
    // Провери дали вече е инициализиран
    if (await memory.exists()) {
      console.log(chalk.yellow('⚠️  Проектът вече има .memory/ папка.'));
      const { proceed } = await inquirer.prompt([{
        type: 'confirm',
        name: 'proceed',
        message: 'Искаш ли да презапишеш?',
        default: false
      }]);
      if (!proceed) return;
    }
    
    // Вземи име на проекта
    let projectName = options.name;
    if (!projectName) {
      const { name } = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Име на проекта:',
        default: path.basename(process.cwd())
      }]);
      projectName = name;
    }
    
    // Създай .memory/
    await memory.initialize(projectName);
    
    // Създай IDE rules
    await createProjectRules(process.cwd());
    
    console.log(chalk.green('\n✅ Проектът е инициализиран!'));
    console.log(chalk.gray('\nСъздадени файлове:'));
    console.log(chalk.gray('  .memory/STATE.md'));
    console.log(chalk.gray('  .memory/LOG.md'));
    console.log(chalk.gray('  .memory/ARCHITECTURE.md'));
    console.log(chalk.gray('  .memory/TOOLS.md'));
    console.log(chalk.gray('  .memory/TODO.md'));
    console.log(chalk.gray('  .memory/DECISIONS.md'));
    console.log(chalk.gray('  .memory/PROBLEMS.md'));
    console.log(chalk.gray('  .memory/MODE.md'));
    console.log(chalk.gray('  .cursorrules'));
    console.log(chalk.gray('  CLAUDE.md'));
  });

// ----------------------------------------------------------------------------
// svet onboard - Вкарай съществуващ проект
// ----------------------------------------------------------------------------
program
  .command('onboard')
  .description('Вкарай съществуващ проект в Svet_AI (дълбок анализ)')
  .action(async () => {
    showBanner();
    console.log(chalk.yellow('📥 РЕЖИМ ONBOARD\n'));
    console.log(chalk.cyan('Този режим ще анализира проекта в дълбочина и ще създаде .memory/\n'));
    
    const modes = new Modes(process.cwd());
    await modes.onboard();
  });

// ----------------------------------------------------------------------------
// svet repair - Режим ремонт
// ----------------------------------------------------------------------------
program
  .command('repair')
  .description('Влез в режим ремонт (backup + одобрение на всяка стъпка)')
  .action(async () => {
    showBanner();
    console.log(chalk.red('🔧 РЕЖИМ РЕМОНТ АКТИВЕН\n'));
    
    const modes = new Modes(process.cwd());
    await modes.activateRepairMode();
  });

// ----------------------------------------------------------------------------
// svet analyze - Дълбок анализ (за legacy системи)
// ----------------------------------------------------------------------------
program
  .command('analyze')
  .description('Дълбок анализ на проекта (за EXTEND или REWRITE)')
  .action(async () => {
    showBanner();
    console.log(chalk.magenta('🔬 РЕЖИМ DEEP ANALYSIS\n'));
    
    const modes = new Modes(process.cwd());
    await modes.deepAnalysis();
  });

// ----------------------------------------------------------------------------
// svet status - Покажи текущото състояние
// ----------------------------------------------------------------------------
program
  .command('status')
  .description('Покажи текущото състояние на проекта')
  .action(async () => {
    showBanner();
    
    const memory = new Memory(process.cwd());
    
    if (!await memory.exists()) {
      console.log(chalk.red('❌ Този проект не е инициализиран.'));
      console.log(chalk.gray('   Използвай: svet init'));
      return;
    }
    
    await memory.showStatus();
  });

// ----------------------------------------------------------------------------
// svet tools - Покажи налични инструменти
// ----------------------------------------------------------------------------
program
  .command('tools')
  .description('Покажи налични инструменти')
  .option('--category <cat>', 'Филтрирай по категория')
  .action(async (options) => {
    showBanner();
    
    const tools = new Tools();
    await tools.list(options.category);
  });

// ----------------------------------------------------------------------------
// svet mcp-wizard - Wizard за създаване на MCP сървър
// ----------------------------------------------------------------------------
program
  .command('mcp-wizard')
  .description('Интерактивен wizard за създаване на MCP сървър')
  .action(async () => {
    showBanner();
    
    const wizard = new MCPWizard();
    await wizard.run();
  });

// ----------------------------------------------------------------------------
// svet log - Добави запис в лога
// ----------------------------------------------------------------------------
program
  .command('log <message>')
  .description('Добави ръчен запис в LOG.md')
  .action(async (message) => {
    const memory = new Memory(process.cwd());
    
    if (!await memory.exists()) {
      console.log(chalk.red('❌ Този проект не е инициализиран.'));
      return;
    }
    
    await memory.addLog(message, 'manual');
    console.log(chalk.green('✓ Записът е добавен в LOG.md'));
  });

// ----------------------------------------------------------------------------
// Интерактивен режим (без команда)
// ----------------------------------------------------------------------------
program
  .action(async () => {
    showBanner();
    
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Какво искаш да направиш?',
      choices: [
        { name: '📁 Инициализирай нов проект (init)', value: 'init' },
        { name: '📥 Вкарай съществуващ проект (onboard)', value: 'onboard' },
        { name: '🔧 Режим ремонт (repair)', value: 'repair' },
        { name: '🔬 Дълбок анализ (analyze)', value: 'analyze' },
        { name: '📊 Покажи статус (status)', value: 'status' },
        { name: '🛠️  Покажи инструменти (tools)', value: 'tools' },
        { name: '🏭 MCP Wizard (mcp-wizard)', value: 'mcp-wizard' },
        { name: '⚙️  Глобална настройка (setup)', value: 'setup' },
        new inquirer.Separator(),
        { name: '❌ Изход', value: 'exit' }
      ]
    }]);
    
    if (action === 'exit') {
      console.log(chalk.gray('Довиждане! 👋'));
      return;
    }
    
    // Изпълни избраната команда
    await program.parseAsync(['node', 'svet', action]);
  });

// ============================================================================
// HELPERS
// ============================================================================

function generateGlobalRules(ide: string): string {
  return `# Svet_AI - Глобални правила за ${ide}

## 🧠 Система за памет

Този проект използва Svet_AI за управление на паметта и контекста.

### При започване на работа:
1. ПЪРВО прочети \`.memory/STATE.md\` - там е текущото състояние
2. Прочети \`.memory/MODE.md\` - в какъв режим сме
3. При нужда прочети \`.memory/ARCHITECTURE.md\` и \`.memory/TOOLS.md\`

### При работа:
- Обновявай \`.memory/LOG.md\` след всяка значима промяна
- Записвай решения в \`.memory/DECISIONS.md\`
- Добавяй проблеми в \`.memory/PROBLEMS.md\`

### Режими:

**🆕 NORMAL** (по подразбиране)
- Работи нормално
- Обновявай .memory/ след промени

**🔧 REPAIR** (ако MODE.md казва "repair")
- BACKUP преди всяка промяна
- ПИТАЙ за одобрение преди всяка стъпка
- Детайлно обяснявай какво и защо

**📥 ONBOARD** (за нови проекти)
- Анализирай в дълбочина
- Документирай цялата логика
- Питай за потвърждение

**🔬 DEEP ANALYSIS** (за legacy системи)
- Пълен анализ на всичко
- Извличане на бизнес логика
- Подготовка за EXTEND или REWRITE

## 🛠️ Налични инструменти (Svet_AI)

### MCP Server Creators:
- **FastMCP** (Python) - препоръчителен за MCP сървъри
- **generator-mcp** (Node.js) - за бърз старт
- **openapi-to-mcpserver** - за съществуващи REST APIs (⚠️ внимание)

### Agent Frameworks:
- CrewAI - multi-agent системи
- LangChain - RAG и workflows
- AutoGen - enterprise агенти

### Използвай \`svet tools\` за пълен списък.
`;
}

async function createProjectRules(projectDir: string): Promise<void> {
  const rulesContent = `# Svet_AI - Правила за този проект

## 🧠 Памет на проекта

Проектът използва Svet_AI. Паметта е в \`.memory/\` папката.

### ВИНАГИ първо прочети:
\`\`\`
.memory/STATE.md    ← Къде сме сега
.memory/MODE.md     ← В какъв режим сме
\`\`\`

### При нужда прочети:
\`\`\`
.memory/ARCHITECTURE.md  ← Структура на проекта
.memory/TOOLS.md         ← Какви инструменти ползваме
.memory/TODO.md          ← Какво остава
.memory/DECISIONS.md     ← Защо сме избрали X
.memory/PROBLEMS.md      ← Срещнати проблеми
\`\`\`

### След работа ВИНАГИ обнови:
\`\`\`
.memory/STATE.md    ← Ново състояние
.memory/LOG.md      ← Какво направи
\`\`\`

## 🔧 Режими

Провери \`.memory/MODE.md\` за текущия режим:

| Режим | Поведение |
|-------|-----------|
| NORMAL | Работи + обновявай .memory/ |
| REPAIR | Backup + питай преди всяка стъпка |
| ONBOARD | Анализирай + документирай |
| ANALYZE | Дълбок анализ + план |
| EXTEND | Добавяй без да пипаш старото |
| REWRITE | Нов код, същият UX |

## 🛠️ Инструменти

Виж \`.memory/TOOLS.md\` за инструментите на този проект.
`;

  // .cursorrules
  await fs.writeFile(path.join(projectDir, '.cursorrules'), rulesContent);
  
  // CLAUDE.md
  await fs.writeFile(path.join(projectDir, 'CLAUDE.md'), rulesContent);
  
  // .antigravity/rules.md
  const antigravityDir = path.join(projectDir, '.antigravity');
  await fs.ensureDir(antigravityDir);
  await fs.writeFile(path.join(antigravityDir, 'rules.md'), rulesContent);
}

// ============================================================================
// RUN
// ============================================================================

program.parse();
