# Лог на проекта

## 2026-02-03

### 15:30 ✅ Създадена документация за Iron Rules
- Създаден documents/IRON_RULES.md — 11 правила за AI агенти
- Създаден documents/USER_GUIDE.md — наръчник за потребителя
- Създаден documents/REFRESH_REMINDER.md — кратко напомняне за Context Refresh
- Записани решения в .memory/DECISIONS.md
- Обновен .memory/STATE.md

**Причина:** При реална употреба агентите "забравят" контекста, редактират "на парче", не правят backup.

---

### 16:45 ✅ v1.1.0 — Iron Rules интегрирани в кода
- Backup на src/cli.ts и package.json в .memory/backups/2026-02-03_v1.0.0/
- Обновен src/cli.ts:
  - VERSION: 1.0.0 → 1.1.0
  - generateGlobalRules() — добавени Iron Rules
  - createProjectRules() — добавени Iron Rules
- Обновен package.json: version 1.1.0

**Промени в шаблоните:**
- CLAUDE.md, .cursorrules, .antigravity/rules.md сега включват:
  - 11 Iron Rules
  - Context Refresh протокол
  - Тригери за команди

**Следваща стъпка:** npm run build && тест

---

## 2026-02-01

### 10:56 - Инициализация
- Проектът "svet-ai" е създаден
- Svet_AI е инициализиран
- Режим: NORMAL

---

