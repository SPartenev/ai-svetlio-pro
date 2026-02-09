# Състояние на проекта

## Проект: ai-svetlio

## Текущо състояние
- **Статус:** ✅ v1.4.0 - стабилна версия
- **Последна сесия:** 2026-02-09
- **Текуща задача:** Publish v1.4.0 (svetlio web + shortcut + launcher)

## Версия: 1.4.0

## Какво включва текущата версия
- **v1.0.0:** Базова функционалност, .memory/ система
- **v1.1.0:** Iron Rules (11 правила за AI агенти), Context Refresh, Big Task Protocol
- **v1.2.0:** MCP Registry интеграция (16,000+ сървъра), `svetlio tools add/remove/info`
- **v1.2.1:** Документация за безопасно обновяване в USER_GUIDE.md
- **v1.3.0:** Ребрандиране от svet-ai към ai-svetlio
- **v1.3.1:** Пълно ребрандиране на всички файлове (~40 файла, ~5600 промени)
- **v1.3.2:** Fix на VERSION константа в CLI
- **v1.3.3:** Docs improvements — Context Refresh ~15, подробно инсталиране/деинсталиране, шаблони "старт"/"продължаваме"
- **v1.4.0:** Web Viewer (`svetlio web`) — визуален read-only преглед на .memory/ в браузъра, auto-refresh, desktop shortcut, open-memory launcher

## Публикувано
- ⏳ npm: ai-svetlio@1.4.0 (чака publish)
- ⏳ GitHub: (чака commit)

## Следваща стъпка
1. Еднодумни workflow команди: `svetlio start`, `svetlio continue`, `svetlio end`, `svetlio import` (+ БГ варианти: старт, продължи, край, вкарай)
2. `svetlio upgrade` команда — автоматично обновяване на CLAUDE.md/.cursorrules без да пипа .memory/
3. По-добра интеграция с MCP Registry API (пагинация, детайлни резултати)
