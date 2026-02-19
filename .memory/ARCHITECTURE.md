# Архитектура на проекта

## Проект: ai-svetlio-pro
## Версия: 1.0.0

## Структура
```
ai-svetlio-pro/
├── src/                          ← TypeScript изходен код
│   ├── cli.ts                    ← Главен CLI entry point (VERSION, init, upgrade, всички команди)
│   ├── sync.ts                   ← 🆕 Hub Sync система (push, pull, auto-sync, config)
│   ├── modes.ts                  ← Режими (NORMAL, REPAIR, ONBOARD, ANALYZE) + createProjectRules()
│   ├── memory.ts                 ← .memory/ система (initialize, файлови шаблони, auto-sync hooks)
│   ├── tools.ts                  ← MCP Registry + вграден каталог с инструменти
│   ├── requests.ts               ← .requests/ система (initialize, inbox check, Python bridge)
│   ├── web.ts                    ← Web Viewer (HTTP сървър, /api/ endpoints, sync status)
│   └── mcp-wizard.ts             ← MCP wizard за инсталация
│
├── dist/                         ← Компилиран JavaScript (npm publish)
│
├── documents/                    ← Справочна документация
│   ├── IRON_RULES.md
│   ├── USER_GUIDE.md
│   └── archive/
│
├── templates/                    ← Шаблони, копирани при svetlio-pro init
│   └── requests/
│
├── .memory/                      ← Памет на ТОЗИ проект (не се publish-ва)
├── .requests/                    ← Заявки за ТОЗИ проект (не се publish-ва)
│
├── README.md
├── CLAUDE.md
├── .cursorrules
├── .antigravity/rules.md
├── registry.yaml
├── package.json
└── .npmignore
```

## Глобална конфигурация (Hub Sync)
```
~/.ai-svetlio/
├── hub-config.json               ← Hub Sync конфигурация (per-machine)
└── hub/                          ← Клонирано hub repo
    ├── .hub-meta.json
    ├── .gitattributes
    ├── project-1/                ← .memory/ файлове на проект 1
    ├── project-2/
    └── ...
```

## Технологии
- **Runtime:** Node.js >= 18
- **Език:** TypeScript 5.3+
- **Пакети:** chalk, commander, inquirer, yaml, glob, fs-extra, node-fetch
- **Build:** tsc → dist/
- **Публикуване:** npm (ai-svetlio-pro)
- **Git CLI:** За Hub Sync операции (без нови npm зависимости)
- **Optional:** Python 3 (за process_inbox, office_extractor, pdf_extractor)

## Компоненти

### CLI (src/cli.ts)
- Entry point — всички `svetlio-pro` команди
- `init` → извиква memory.initialize() + requests.initialize() + createProjectRules()
- `sync` → Hub Sync подкоманди (init, push, pull, status, auto, remove)
- VERSION константа — трябва да се обновява ръчно при bump

### Sync (src/sync.ts) 🆕
- `SyncManager` клас — управлява hub repo, config, sync операции
- `initHub()` → създава/свързва hub repo, регистрира проект
- `push()` → копира .memory/ → hub, git commit + push
- `pull()` → git pull, копира hub → .memory/ (с backup)
- `triggerAutoSyncPush()` → тих auto-push (за Memory hooks)
- Конфигурация: `~/.ai-svetlio/hub-config.json`

### Memory (src/memory.ts)
- `initialize()` → създава .memory/ с 8 файла
- `initAutoSync()` → зарежда SyncManager ако autoSync е включен
- Auto-sync hooks в `writeFile()` — debounced push (30 сек)

### Modes (src/modes.ts)
- Генерира CLAUDE.md, .cursorrules, .antigravity/rules.md
- Включва sync секция в шаблоните

### Web Viewer (src/web.ts)
- HTTP сървър на localhost:3847
- `/api/sync` endpoint — sync status
- UI карта за sync в sidebar-а

### Requests, Tools, MCP Wizard
- Без промяна спрямо ai-svetlio v1.5.7

## Важни бележки

### При version bump — обнови 3 места:
1. `package.json` → "version"
2. `src/cli.ts` → VERSION константа
3. `src/modes.ts` → VERSION константа

### Три защитени зони при upgrade:
1. `.memory/` — НЕ се пипа
2. `.requests/` — НЕ се пипа
3. `CLAUDE.md` — се презаписва (с backup)
