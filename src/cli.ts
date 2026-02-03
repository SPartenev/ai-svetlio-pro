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

const VERSION = '1.2.1';

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
// svet tools - Управление на инструменти
// ----------------------------------------------------------------------------
const toolsCommand = program
  .command('tools')
  .description('Управление на инструменти (MCP сървъри, агенти, skills)');

// svet tools (без подкоманда) - показва каталога
toolsCommand
  .action(async () => {
    showBanner();
    const tools = new Tools();
    await tools.list();
  });

// svet tools list
toolsCommand
  .command('list')
  .description('Покажи каталога с налични инструменти')
  .option('--category <cat>', 'Филтрирай по категория')
  .action(async (options) => {
    showBanner();
    const tools = new Tools();
    await tools.list(options.category);
  });

// svet tools add <id>
toolsCommand
  .command('add <toolId>')
  .description('Добави инструмент към проекта')
  .action(async (toolId) => {
    showBanner();
    const tools = new Tools();
    await tools.add(toolId);
  });

// svet tools remove <id>
toolsCommand
  .command('remove <toolId>')
  .description('Премахни инструмент от проекта')
  .action(async (toolId) => {
    showBanner();
    const tools = new Tools();
    await tools.remove(toolId);
  });

// svet tools info <id>
toolsCommand
  .command('info <toolId>')
  .description('Покажи детайли за инструмент')
  .action(async (toolId) => {
    showBanner();
    const tools = new Tools();
    await tools.info(toolId);
  });

// ----------------------------------------------------------------------------
// svet registry - Търсене в MCP Registry
// ----------------------------------------------------------------------------
program
  .command('registry <query>')
  .description('Търси в официалния MCP Registry (16,000+ сървъра)')
  .action(async (query) => {
    showBanner();
    const tools = new Tools();
    await tools.searchRegistry(query);
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
        new inquirer.Separator('─── Инструменти ───'),
        { name: '🛠️  Каталог инструменти (tools)', value: 'tools' },
        { name: '🔍 Търси в MCP Registry (registry)', value: 'registry-search' },
        { name: '🏭 MCP Wizard (mcp-wizard)', value: 'mcp-wizard' },
        new inquirer.Separator(),
        { name: '⚙️  Глобална настройка (setup)', value: 'setup' },
        { name: '❌ Изход', value: 'exit' }
      ]
    }]);
    
    if (action === 'exit') {
      console.log(chalk.gray('Довиждане! 👋'));
      return;
    }

    // Специален случай за registry search
    if (action === 'registry-search') {
      const { query } = await inquirer.prompt([{
        type: 'input',
        name: 'query',
        message: 'Търси в MCP Registry:',
        default: 'database'
      }]);
      const tools = new Tools();
      await tools.searchRegistry(query);
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

| Режим | Поведение |
|-------|-----------|
| NORMAL | Работи + обновявай .memory/ |
| REPAIR | Backup + питай преди всяка стъпка |
| ONBOARD | Анализирай + документирай |
| ANALYZE | Дълбок анализ + план |

---

## 🔒 IRON RULES (Задължителни правила)

### ПАМЕТ И КОНТЕКСТ
1. **ПАМЕТ ПЪРВО** — Винаги започвай от .memory/STATE.md и MODE.md
2. **НЕ ГАДАЙ** — Чети ARCHITECTURE.md, не търси "на посоки"
3. **ПРОЧЕТИ ЦЕЛИЯ КОД** — Преди редакция, прочети целия файл
4. **CONTEXT REFRESH** — На всеки ~20 съобщения прочети .memory/ отново

### БЕЗОПАСНОСТ
5. **ЗАДЪЛЖИТЕЛЕН BACKUP** — Преди редакция на работещ код
6. **ЗАЩИТЕНИ ЗОНИ** — Не пипай критични папки без одобрение
7. **ВЕРИФИЦИРАЙ** — Провери резултата с втори източник

### ПРОЦЕС
8. **ДОКУМЕНТИРАЙ ПЪРВО** — Запиши в DECISIONS.md преди промяна
9. **СТРУКТУРА** — Файлове на правилното място
10. **ГОЛЕМИ ЗАДАЧИ = МАЛКИ СТЪПКИ** — >150 реда или >2 файла → план първо
11. **ПИТАЙ ПРИ СЪМНЕНИЕ** — По-добре да питаш

### ТРИГЕРИ
| Потребителят казва | Действие |
|-------------------|----------|
| "refresh" | Context Refresh |
| "внимавай" | REPAIR режим |
| "backup първо" | Задължителен backup |

## 🛠️ Инструменти

Използвай \`svet tools\` за пълен списък.
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

---

## 🔒 IRON RULES (Задължителни правила)

### ПАМЕТ И КОНТЕКСТ
1. **ПАМЕТ ПЪРВО** — Винаги започвай от .memory/STATE.md и MODE.md
2. **НЕ ГАДАЙ** — Чети ARCHITECTURE.md, не търси "на посоки" (ls -R, find /)
3. **ПРОЧЕТИ ЦЕЛИЯ КОД** — Преди редакция, прочети целия файл. Ако е >150 реда → направи summary първо
4. **CONTEXT REFRESH** — На всеки ~20 съобщения прочети .memory/ отново и потвърди с потребителя

### БЕЗОПАСНОСТ
5. **ЗАДЪЛЖИТЕЛЕН BACKUP** — Преди редакция на работещ код → копирай в .memory/backups/
6. **ЗАЩИТЕНИ ЗОНИ** — Не пипай критични папки без Backup + User Approval
7. **ВЕРИФИЦИРАЙ** — Не приемай резултат "на сляпо", провери с втори източник

### ПРОЦЕС
8. **ДОКУМЕНТИРАЙ ПЪРВО** — Запиши в DECISIONS.md преди значима промяна
9. **СТРУКТУРА** — Нови файлове на правилното място (виж ARCHITECTURE.md)
10. **ГОЛЕМИ ЗАДАЧИ = МАЛКИ СТЪПКИ** — Ако файл >150 реда или >2 файла → раздели на стъпки, покажи план, чакай одобрение
11. **ПИТАЙ ПРИ СЪМНЕНИЕ** — По-добре да питаш, отколкото да счупиш нещо

### CONTEXT REFRESH ПРОТОКОЛ
При refresh кажи:
\`\`\`
⚡ Context Refresh:
- Работим по: [от STATE.md]
- Режим: [от MODE.md]
- Следваща задача: [от TODO.md]
Продължавам ли?
\`\`\`

### ТРИГЕРИ
| Потребителят казва | Действие |
|-------------------|----------|
| "refresh" / "провери контекста" | Context Refresh |
| "внимавай" / "важно е" | REPAIR режим |
| "backup първо" | Задължителен backup |
| "обясни плана" | Покажи стъпките преди да започнеш |
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
