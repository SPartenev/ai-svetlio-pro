/**
 * Svet_AI - Memory Module
 * 
 * Управлява .memory/ папката и всички файлове в нея.
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

export class Memory {
  private projectDir: string;
  private memoryDir: string;
  
  constructor(projectDir: string) {
    this.projectDir = projectDir;
    this.memoryDir = path.join(projectDir, '.memory');
  }
  
  // ==========================================================================
  // ОСНОВНИ ОПЕРАЦИИ
  // ==========================================================================
  
  async exists(): Promise<boolean> {
    return fs.pathExists(this.memoryDir);
  }
  
  async initialize(projectName: string): Promise<void> {
    await fs.ensureDir(this.memoryDir);
    await fs.ensureDir(path.join(this.memoryDir, 'backups'));
    await fs.ensureDir(path.join(this.memoryDir, 'analysis'));
    await fs.ensureDir(path.join(this.memoryDir, 'rewrite'));
    
    const now = new Date().toISOString();
    const dateStr = now.split('T')[0];
    const timeStr = now.split('T')[1].substring(0, 5);
    
    // STATE.md
    await this.writeFile('STATE.md', `# Състояние на проекта

## Проект: ${projectName}

## Текущо състояние
- **Статус:** Нов проект
- **Последна сесия:** ${dateStr}
- **Текуща задача:** Няма

## Контекст
Проектът е току-що инициализиран. Готов за работа.

## Следваща стъпка
Опиши какво искаш да направиш.
`);

    // LOG.md
    await this.writeFile('LOG.md', `# Лог на проекта

## ${dateStr}

### ${timeStr} - Инициализация
- Проектът "${projectName}" е създаден
- Svet_AI е инициализиран
- Режим: NORMAL

---

`);

    // ARCHITECTURE.md
    await this.writeFile('ARCHITECTURE.md', `# Архитектура на проекта

## Проект: ${projectName}

## Структура
\`\`\`
${projectName}/
├── .memory/          ← Svet_AI памет
├── src/              ← Код (ако има)
└── ...
\`\`\`

## Технологии
- [ ] Добави технологиите когато са избрани

## Компоненти
- [ ] Добави компонентите когато са създадени

## Връзки между компоненти
- [ ] Добави диаграма когато има такава

`);

    // TOOLS.md
    await this.writeFile('TOOLS.md', `# Инструменти на проекта

## Проект: ${projectName}

## Използвани инструменти

### MCP Сървъри
- [ ] Няма избрани все още

### Frameworks
- [ ] Няма избрани все още

### Библиотеки
- [ ] Няма избрани все още

## Инсталация
\`\`\`bash
# Добави команди за инсталация когато има такива
\`\`\`

## Конфигурация
- [ ] Добави конфигурация когато има такава

`);

    // TODO.md
    await this.writeFile('TODO.md', `# Задачи

## Проект: ${projectName}

## 🔴 Приоритетни
- [ ] Дефинирай целта на проекта

## 🟡 В процес
- (нищо засега)

## 🟢 Готови
- [x] Инициализация на Svet_AI

## 📋 Backlog
- (добави задачи тук)

`);

    // DECISIONS.md
    await this.writeFile('DECISIONS.md', `# Решения

## Проект: ${projectName}

## Формат
Всяко решение се записва така:

### [Дата] Заглавие на решението
**Контекст:** Защо беше нужно това решение
**Решение:** Какво избрахме
**Алтернативи:** Какво друго разгледахме
**Последствия:** Какво следва от решението

---

## Решения

### ${dateStr} Избор на Svet_AI
**Контекст:** Нужда от система за памет и управление на проекти с AI
**Решение:** Използваме Svet_AI за .memory/ система
**Алтернативи:** Ръчна документация, други системи
**Последствия:** AI агентите ще имат достъп до контекст между сесии

`);

    // PROBLEMS.md
    await this.writeFile('PROBLEMS.md', `# Проблеми и решения

## Проект: ${projectName}

## Формат
\`\`\`
### [Дата] Кратко описание
**Проблем:** Какво се случи
**Причина:** Защо се случи (ако е известна)
**Решение:** Как го оправихме
**Превенция:** Как да избегнем в бъдеще
\`\`\`

---

## Проблеми

(Няма проблеми засега - добре!)

`);

    // MODE.md
    await this.writeFile('MODE.md', `# Текущ режим

## Режим: NORMAL

## Описание
Нормален режим на работа. AI агентът:
- Работи по задачи
- Обновява .memory/ след промени
- Не изисква специално одобрение

## Налични режими

| Команда | Режим | Описание |
|---------|-------|----------|
| \`svet repair\` | REPAIR | Backup + одобрение на всяка стъпка |
| \`svet onboard\` | ONBOARD | Дълбок анализ на съществуващ проект |
| \`svet analyze\` | ANALYZE | Дълбок анализ за EXTEND/REWRITE |

## История на режимите
- ${dateStr} ${timeStr}: NORMAL (инициализация)

`);
  }
  
  // ==========================================================================
  // ЧЕТЕНЕ И ПИСАНЕ
  // ==========================================================================
  
  async readFile(filename: string): Promise<string | null> {
    const filePath = path.join(this.memoryDir, filename);
    if (await fs.pathExists(filePath)) {
      return fs.readFile(filePath, 'utf-8');
    }
    return null;
  }
  
  async writeFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.memoryDir, filename);
    await fs.writeFile(filePath, content);
  }
  
  async appendToFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.memoryDir, filename);
    await fs.appendFile(filePath, content);
  }
  
  // ==========================================================================
  // LOG ОПЕРАЦИИ
  // ==========================================================================
  
  async addLog(message: string, type: string = 'info'): Promise<void> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);
    
    const icons: Record<string, string> = {
      'info': 'ℹ️',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'manual': '📝',
      'repair': '🔧',
      'backup': '💾',
      'decision': '🎯',
      'mode': '🔄'
    };
    
    const icon = icons[type] || 'ℹ️';
    const entry = `### ${timeStr} ${icon} ${message}\n\n`;
    
    // Прочети текущия лог
    let log = await this.readFile('LOG.md') || '# Лог на проекта\n\n';
    
    // Провери дали днешната дата я има
    if (!log.includes(`## ${dateStr}`)) {
      log += `## ${dateStr}\n\n`;
    }
    
    // Добави entry след датата
    const dateIndex = log.indexOf(`## ${dateStr}`);
    const nextDateIndex = log.indexOf('\n## ', dateIndex + 1);
    
    if (nextDateIndex === -1) {
      // Няма следваща дата, добави в края
      log += entry;
    } else {
      // Добави преди следващата дата
      log = log.slice(0, nextDateIndex) + entry + log.slice(nextDateIndex);
    }
    
    await this.writeFile('LOG.md', log);
  }
  
  // ==========================================================================
  // STATE ОПЕРАЦИИ
  // ==========================================================================
  
  async updateState(updates: {
    status?: string;
    currentTask?: string;
    context?: string;
    nextStep?: string;
  }): Promise<void> {
    let state = await this.readFile('STATE.md') || '';
    const now = new Date().toISOString().split('T')[0];
    
    if (updates.status) {
      state = state.replace(/\*\*Статус:\*\* .+/, `**Статус:** ${updates.status}`);
    }
    if (updates.currentTask) {
      state = state.replace(/\*\*Текуща задача:\*\* .+/, `**Текуща задача:** ${updates.currentTask}`);
    }
    state = state.replace(/\*\*Последна сесия:\*\* .+/, `**Последна сесия:** ${now}`);
    
    if (updates.context) {
      state = state.replace(/## Контекст\n[\s\S]*?(?=\n## |$)/, `## Контекст\n${updates.context}\n\n`);
    }
    if (updates.nextStep) {
      state = state.replace(/## Следваща стъпка\n[\s\S]*?(?=\n## |$)/, `## Следваща стъпка\n${updates.nextStep}\n`);
    }
    
    await this.writeFile('STATE.md', state);
  }
  
  // ==========================================================================
  // MODE ОПЕРАЦИИ
  // ==========================================================================
  
  async getMode(): Promise<string> {
    const mode = await this.readFile('MODE.md');
    if (!mode) return 'NORMAL';
    
    const match = mode.match(/## Режим: (\w+)/);
    return match ? match[1] : 'NORMAL';
  }
  
  async setMode(mode: string, description: string): Promise<void> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);
    
    const modeDescriptions: Record<string, string> = {
      'NORMAL': 'Нормален режим на работа. AI агентът работи по задачи и обновява .memory/ след промени.',
      'REPAIR': 'Режим ремонт. AI агентът прави backup преди всяка промяна и пита за одобрение на всяка стъпка.',
      'ONBOARD': 'Режим за вкарване на съществуващ проект. AI агентът анализира в дълбочина и документира.',
      'ANALYZE': 'Режим за дълбок анализ. Подготовка за EXTEND или REWRITE.',
      'EXTEND': 'Режим за разширение. Добавяне на нови функции без промяна на съществуващия код.',
      'REWRITE': 'Режим за пренаписване. Нов код със съвременни технологии, същият потребителски опит.'
    };
    
    const content = `# Текущ режим

## Режим: ${mode}

## Описание
${modeDescriptions[mode] || description}

## Специални инструкции
${description}

## Налични режими

| Команда | Режим | Описание |
|---------|-------|----------|
| \`svet repair\` | REPAIR | Backup + одобрение на всяка стъпка |
| \`svet onboard\` | ONBOARD | Дълбок анализ на съществуващ проект |
| \`svet analyze\` | ANALYZE | Дълбок анализ за EXTEND/REWRITE |

## История на режимите
- ${dateStr} ${timeStr}: ${mode}

`;
    
    await this.writeFile('MODE.md', content);
    await this.addLog(`Режим сменен на ${mode}`, 'mode');
  }
  
  // ==========================================================================
  // BACKUP ОПЕРАЦИИ
  // ==========================================================================
  
  async createBackup(files: string[], reason: string): Promise<string> {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const backupDir = path.join(this.memoryDir, 'backups', timestamp);
    
    await fs.ensureDir(backupDir);
    
    // Копирай файловете
    for (const file of files) {
      const srcPath = path.join(this.projectDir, file);
      if (await fs.pathExists(srcPath)) {
        const destPath = path.join(backupDir, file);
        await fs.ensureDir(path.dirname(destPath));
        await fs.copy(srcPath, destPath);
      }
    }
    
    // Създай SNAPSHOT.md
    const snapshot = `# Backup Snapshot

## Timestamp: ${now.toISOString()}

## Причина
${reason}

## Файлове
${files.map(f => `- ${f}`).join('\n')}

## Възстановяване
\`\`\`bash
# За възстановяване на този backup:
cp -r .memory/backups/${timestamp}/* ./
\`\`\`
`;
    
    await fs.writeFile(path.join(backupDir, 'SNAPSHOT.md'), snapshot);
    await this.addLog(`Backup създаден: ${timestamp} (${reason})`, 'backup');
    
    return backupDir;
  }
  
  async listBackups(): Promise<string[]> {
    const backupsDir = path.join(this.memoryDir, 'backups');
    if (!await fs.pathExists(backupsDir)) return [];
    
    const entries = await fs.readdir(backupsDir);
    return entries.filter(e => !e.startsWith('.'));
  }
  
  async restoreBackup(timestamp: string): Promise<boolean> {
    const backupDir = path.join(this.memoryDir, 'backups', timestamp);
    
    if (!await fs.pathExists(backupDir)) {
      return false;
    }
    
    const snapshot = await fs.readFile(path.join(backupDir, 'SNAPSHOT.md'), 'utf-8');
    const filesMatch = snapshot.match(/## Файлове\n([\s\S]*?)(?=\n## |$)/);
    
    if (filesMatch) {
      const files = filesMatch[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
      
      for (const file of files) {
        const srcPath = path.join(backupDir, file);
        const destPath = path.join(this.projectDir, file);
        
        if (await fs.pathExists(srcPath)) {
          await fs.copy(srcPath, destPath);
        }
      }
    }
    
    await this.addLog(`Backup възстановен: ${timestamp}`, 'backup');
    return true;
  }
  
  // ==========================================================================
  // STATUS
  // ==========================================================================
  
  async showStatus(): Promise<void> {
    const state = await this.readFile('STATE.md');
    const mode = await this.getMode();
    const todo = await this.readFile('TODO.md');
    
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.cyan('                    СТАТУС НА ПРОЕКТА'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    
    // Режим
    const modeColors: Record<string, typeof chalk> = {
      'NORMAL': chalk.green,
      'REPAIR': chalk.red,
      'ONBOARD': chalk.yellow,
      'ANALYZE': chalk.magenta,
      'EXTEND': chalk.blue,
      'REWRITE': chalk.cyan
    };
    const modeColor = modeColors[mode] || chalk.white;
    console.log(`\n${chalk.bold('Режим:')} ${modeColor(mode)}`);
    
    // State info
    if (state) {
      const statusMatch = state.match(/\*\*Статус:\*\* (.+)/);
      const taskMatch = state.match(/\*\*Текуща задача:\*\* (.+)/);
      const sessionMatch = state.match(/\*\*Последна сесия:\*\* (.+)/);
      
      if (statusMatch) console.log(`${chalk.bold('Статус:')} ${statusMatch[1]}`);
      if (taskMatch) console.log(`${chalk.bold('Задача:')} ${taskMatch[1]}`);
      if (sessionMatch) console.log(`${chalk.bold('Последна сесия:')} ${sessionMatch[1]}`);
    }
    
    // TODO summary
    if (todo) {
      const priorityMatch = todo.match(/## 🔴 Приоритетни\n([\s\S]*?)(?=\n## |$)/);
      const inProgressMatch = todo.match(/## 🟡 В процес\n([\s\S]*?)(?=\n## |$)/);
      
      console.log(`\n${chalk.bold('Задачи:')}`);
      
      if (priorityMatch) {
        const items = priorityMatch[1].split('\n').filter(l => l.startsWith('- [ ]'));
        if (items.length > 0) {
          console.log(chalk.red(`  🔴 Приоритетни: ${items.length}`));
        }
      }
      
      if (inProgressMatch) {
        const items = inProgressMatch[1].split('\n').filter(l => l.startsWith('- [ ]') || l.startsWith('- [x]'));
        if (items.length > 0 && items[0] !== '- (нищо засега)') {
          console.log(chalk.yellow(`  🟡 В процес: ${items.length}`));
        }
      }
    }
    
    // Backups
    const backups = await this.listBackups();
    if (backups.length > 0) {
      console.log(`\n${chalk.bold('Backups:')} ${backups.length} налични`);
    }
    
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
  }
}
