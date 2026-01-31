# 🧰 Svet_AI Quick Reference

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚀 Команди

```bash
svet setup              # Глобална настройка (веднъж)
svet init               # Инициализирай проект
svet onboard            # Вкарай съществуващ проект
svet repair             # Режим ремонт
svet analyze            # Дълбок анализ
svet status             # Покажи състояние
svet tools              # Покажи инструменти
svet mcp-wizard         # Wizard за MCP сървъри
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 Режими

| Режим | Команда | Кога |
|-------|---------|------|
| **NORMAL** | (default) | Текуща работа |
| **REPAIR** | `svet repair` | Поправки (backup + одобрение) |
| **ONBOARD** | `svet onboard` | Съществуващ проект |
| **ANALYZE** | `svet analyze` | Legacy система |
| → EXTEND | (след analyze) | Добави функции |
| → REWRITE | (след analyze) | Пренапиши (същият UX) |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📁 .memory/ структура

```
.memory/
├── STATE.md          ← Къде сме
├── MODE.md           ← Режим
├── LOG.md            ← История
├── ARCHITECTURE.md   ← Структура
├── TOOLS.md          ← Инструменти
├── TODO.md           ← Задачи
├── DECISIONS.md      ← Решения
├── PROBLEMS.md       ← Проблеми
├── analysis/         ← От ANALYZE
├── rewrite/          ← За REWRITE
└── backups/          ← Backups
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🏭 MCP Creators

| Tool | Език | Install |
|------|------|---------|
| **FastMCP** ⭐ | Python | `pip install fastmcp` |
| generator-mcp | Node.js | `npm i -g yo generator-mcp` |
| openapi-to-mcpserver | Node.js | `npm i -g openapi-to-mcpserver` ⚠️ |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔄 Бърз workflow

```bash
# Нов проект
mkdir project && cd project
svet init
cursor .

# Съществуващ проект
cd old-project
svet onboard
cursor .

# Поправка
svet repair
# AI ще пита за одобрение

# Legacy модернизация
svet analyze
# После: EXTEND или REWRITE
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💡 AI команди (кажи на агента)

```
"Прочети .memory/STATE.md"       ← Къде сме
"Влез в режим ремонт"            ← REPAIR mode
"Направи deep analysis"          ← ANALYZE mode
"Искам да добавя X функция"      ← EXTEND
"Пренапиши с React и FastAPI"    ← REWRITE
"Покажи какво остава"            ← TODO
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
