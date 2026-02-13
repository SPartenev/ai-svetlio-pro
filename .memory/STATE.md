# Състояние на проекта

## Проект: ai-svetlio

## Текущо състояние
- **Статус:** ✅ v1.5.7 — repo cleanup + version sync (готова за publish)
- **Последна сесия:** 2026-02-14
- **Текуща задача:** Очаква npm publish

## Версия: 1.5.7

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
- **v1.5.0:** `svetlio upgrade` + .memory/ fix (5 файла) + ClientRequests система (.requests/, Python bridge, Web Viewer интеграция)
- **v1.5.1:** Премахнати клиентски данни от npm пакета (1.8 MB → 128 kB)
- **v1.5.2:** VERSION константи синхронизирани с package.json
- **v1.5.3:** `svetlio upgrade` автоматично създава .requests/ ако липсва
- **v1.5.4:** Добавена `svetlio requests process` команда
- **v1.5.5:** Документация синхронизирана — QUICKREF, USER_GUIDE, README, интерактивно меню
- **v1.5.6:** README банер синхронизиран с версията
- **v1.5.7:** Repo cleanup + version sync — премахнати дубликати, остарели документи в archive/, всички версии синхронизирани, npm пакет 103 kB (от 129 kB), ARCHITECTURE.md обновен

## Публикувано
- ⏳ npm: ai-svetlio@1.5.7 (готова за publish)
- ✅ GitHub: github.com/SPartenev/Ai-Svetlio

## Следваща стъпка
1. npm publish v1.5.7
2. Еднодумни workflow команди: `svetlio start/continue/end/import` (+ БГ варианти)
3. По-добра интеграция с MCP Registry API
4. `svetlio watch` — автоматично следене на inbox
