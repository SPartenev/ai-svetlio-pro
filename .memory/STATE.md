# Състояние на проекта

## Проект: svet-ai

## Текущо състояние
- **Статус:** v1.1.0 готова за npm publish
- **Последна сесия:** 2026-02-03
- **Текуща задача:** Публикуване в npm (по преценка на потребителя)

## Контекст
v1.1.0 включва Iron Rules — 11 задължителни правила за AI агенти:
- Интегрирани в CLAUDE.md, .cursorrules, .antigravity/rules.md шаблоните
- Context Refresh протокол (на всеки ~20 съобщения)
- Backup First правило
- Big Task Protocol (>150 реда → план първо)

## Завършено
- [x] Документация: IRON_RULES.md, USER_GUIDE.md, REFRESH_REMINDER.md
- [x] Backup на v1.0.0 код
- [x] Обновен cli.ts с Iron Rules
- [x] Обновен package.json → 1.1.0
- [x] Записано в .memory/
- [x] npm run build — успешен
- [x] svet init тест — CLAUDE.md съдържа Iron Rules ✅

## Следваща стъпка
Когато решиш, изпълни:
```bash
npm publish
```
Това ще публикува v1.1.0 в npm registry.
