# Архитектура на проекта

## Проект: ai-svetlio
## Версия: 1.5.7

## Структура
```
ai-svetlio/
├── src/                          ← TypeScript изходен код
│   ├── cli.ts                    ← Главен CLI entry point (VERSION, init, upgrade, всички команди)
│   ├── modes.ts                  ← Режими (NORMAL, REPAIR, ONBOARD, ANALYZE) + createProjectRules()
│   ├── memory.ts                 ← .memory/ система (initialize, файлови шаблони)
│   ├── tools.ts                  ← MCP Registry + вграден каталог с инструменти
│   ├── requests.ts               ← .requests/ система (initialize, inbox check, Python bridge)
│   ├── web.ts                    ← Web Viewer (HTTP сървър, /api/ endpoints)
│   └── mcp-wizard.ts             ← MCP wizard за инсталация
│
├── dist/                         ← Компилиран JavaScript (npm publish)
│
├── documents/                    ← Справочна документация (НЕ се ползва от кода)
│   ├── IRON_RULES.md             ← 11-те Iron Rules (актуален)
│   ├── USER_GUIDE.md             ← Наръчник за потребителя (актуален)
│   ├── REFRESH_REMINDER.md       ← Кратко напомняне за Context Refresh
│   └── archive/                  ← Исторически документи от ранни версии
│
├── templates/                    ← Шаблони, копирани при svetlio init
│   └── requests/                 ← .requests/ шаблони
│       ├── README.md, TEMPLATE.md, REGISTRY.md, config.json
│       ├── inbox/README.md
│       ├── archive/README.md
│       └── python/               ← Python инструменти за обработка
│           ├── process_inbox.py
│           ├── office_extractor.py
│           ├── pdf_extractor.py
│           └── requirements.txt
│
├── .memory/                      ← Памет на ТОЗИ проект (не се publish-ва)
├── .requests/                    ← Заявки за ТОЗИ проект (не се publish-ва)
│
├── README.md                     ← Главен README (npm + GitHub)
├── QUICKREF.md                   ← Бърз справочник
├── CLAUDE.md                     ← Правила за Claude Code (генерират се от cli.ts)
├── .cursorrules                  ← Правила за Cursor (генерират се от cli.ts)
├── .antigravity/rules.md         ← Правила за Antigravity (генерират се от cli.ts)
├── registry.yaml                 ← Вграден каталог с MCP инструменти
├── package.json                  ← npm пакет конфигурация
└── .npmignore                    ← Файлове изключени от npm
```

## Технологии
- **Runtime:** Node.js >= 18
- **Език:** TypeScript 5.3+
- **Пакети:** chalk, commander, inquirer, yaml, glob, fs-extra, node-fetch
- **Build:** tsc → dist/
- **Публикуване:** npm (ai-svetlio)
- **Optional:** Python 3 (за process_inbox, office_extractor, pdf_extractor)

## Компоненти

### CLI (src/cli.ts)
- Entry point — всички `svetlio` команди
- `init` → извиква memory.initialize() + requests.initialize() + createProjectRules()
- `upgrade` → регенерира CLAUDE.md/.cursorrules/.antigravity + backup
- VERSION константа — трябва да се обновява ръчно при bump

### Memory (src/memory.ts)
- `initialize()` → създава .memory/ с 8 файла (STATE, LOG, ARCHITECTURE, TOOLS, TODO, DECISIONS, PROBLEMS, MODE)
- Всички шаблони са inline hardcoded

### Modes (src/modes.ts)
- `createProjectRules()` → генерира CLAUDE.md, .cursorrules, .antigravity/rules.md
- Шаблоните са inline hardcoded (с VERSION коментар)
- VERSION константа — трябва да се обновява ръчно при bump

### Requests (src/requests.ts)
- `initialize()` → копира templates/requests/ в .requests/
- `checkInbox()` → проверява .requests/inbox/ за нови файлове
- `processInbox()` → извиква Python bridge за обработка

### Web Viewer (src/web.ts)
- HTTP сървър на localhost:3847
- Показва .memory/ и .requests/ файлове
- Auto-refresh на 5 сек, тъмна/светла тема

### Tools (src/tools.ts)
- Вграден каталог с MCP инструменти
- MCP Registry API интеграция (16,000+ сървъра)

## Важни бележки

### При version bump — обнови 3 места:
1. `package.json` → "version"
2. `src/cli.ts` → VERSION константа
3. `src/modes.ts` → VERSION константа

### documents/ НЕ се ползва от кода
Всички шаблони са или inline в src/ или в templates/. documents/ е само за GitHub справка.

### Три защитени зони при upgrade:
1. `.memory/` — НЕ се пипа
2. `.requests/` — НЕ се пипа
3. `CLAUDE.md` — се презаписва (с backup)
