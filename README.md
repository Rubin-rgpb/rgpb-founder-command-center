# RGPB Founder Command Center — MVP v0.1.2

**Status:** Source-code MVP. Not published, not production-validated. Cloud features require Supabase configuration. Without credentials, browser-local storage is used, and clearing browser data may erase it.

## Requirements
Node.js 20+ and npm for local development. For the initial Android browser test, only an existing GitHub account and GitHub Pages are required. Supabase and Vercel are not required.

## Local development
```bash
npm install
cp .env.example .env.local
npm run dev
```
Open http://localhost:3000. To test without Supabase, leave `.env.local` values empty or omit `.env.local`; a local-only warning appears.

## Supabase cloud setup
1. Create a Supabase project in an account you own.
2. In SQL Editor run `supabase/schema.sql`.
3. In Authentication, configure Email/Password and allowed redirect URLs for localhost and your production domain. Enable email verification and other desired protections.
4. In Project Settings → API copy the project URL and **publishable/anon** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Never put `service_role` or other secret keys in `NEXT_PUBLIC_` variables or the repository.
6. Sign up, verify email if prompted, and sign in. A user-owned row in `user_data` is then created; row-level security policies restrict access by `auth.uid()`.
7. Verify data persistence and access restrictions using two separate test accounts before trusting real data.

**Important:** This MVP saves a single JSON snapshot per user. It is NOT a robust concurrent-edit or offline-first sync engine. Editing the same account on two devices simultaneously can overwrite changes. Use one active device at a time and export backups. For production, implement per-record tables with versioning/optimistic concurrency and a tested conflict-resolution strategy.

## Optional cloud deployment (not required for GitHub Pages preview)
1. Create a **private GitHub repository in your own account**, and push this source code.
2. Import that repository into **your own Vercel account**.
3. Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in Vercel.
4. Deploy. Vercel will provide a real HTTPS URL. No URL is claimed here until you complete deployment.
5. In Supabase Auth URL configuration, add the deployed domain.
6. For a custom domain, configure it in Vercel and update Supabase redirect URLs.

## Android browser test
After a successful GitHub Pages deployment, open the **actual URL shown by GitHub Actions / Settings → Pages** in Android Chrome. Test adding a task, completing it, refreshing the page, timer pause/resume, exporting JSON, and importing a backup. Data remains only in that browser; use JSON export for backups.

The project has a manifest and icon, but no service worker. **Add to Home screen** may create a shortcut; do not claim full offline PWA installation until verified.

## Backup
Settings → **JSON** downloads all categories, tasks, sessions and settings. Keep copies outside the browser, e.g. your own encrypted drive. Settings → **CSV** exports task rows for analysis (not full restoration).

## Restore
Settings → **Import JSON** → choose your saved JSON file → confirm replacement. Existing in-memory data will be replaced and, when authenticated and sync works, the new snapshot is sent to Supabase. Make a fresh backup before importing.

## Updating
Modify the project in GitHub or locally, run `npm install`, `npm run typecheck`, `npm run build`, test the change, commit and push. GitHub Actions can rebuild and redeploy GitHub Pages on each push to `main`.

## Known limitations / incomplete MVP requirements
- No public deployment, external accounts or end-to-end cross-device testing has been performed.
- Offline edits are cached locally but there is no reliable conflict-aware offline synchronization or protected unsynced queue.
- Data is stored as a JSON snapshot per user; no field-level conflict handling.
- No automated server backups configured. Manual JSON backup available.
- Task ordering uses a sort-order field but no drag-and-drop UI yet.
- Recurrence is stored as a field but recurrence generation is not implemented.
- Time allocation does not automatically redistribute when total hours change; a discrepancy warning appears.
- No explicit independent daily business KPIs in this version (planned v2).
- No service worker for offline PWA operation.
- Manual session edits affect total task minutes; session-level editing is not implemented.
- Calendar month and day navigation exists; separate week view is not implemented.
- Multi-user isolation relies on SQL RLS policies and must be verified against your deployed project.
- Dependencies were not installed in the creation environment, so compilation/runtime tests could not be completed here.

## Initial plan
Sales 150 minutes; offers 90 minutes; delivery 75 minutes; management 45 minutes. Total 360 minutes. Percentages calculated from exact minute values.

## GitHub Pages test deployment (without Supabase)
This repository is configured for Next.js static export via `next.config.ts` and `.github/workflows/pages.yml`. No server, Vercel or Supabase is needed for this *browser-local test*. Do not configure Supabase environment variables.

1. Use an existing GitHub account. Create a repository (prefer a dedicated test repository) and upload the **contents** of this project, including the hidden `.github/workflows/pages.yml` file, to its `main` branch. The website itself will be publicly accessible on GitHub Pages, even if the source repository is private on a supported plan.
2. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Go to **Actions → Publish RGPB to GitHub Pages** and check the latest run. On success the deployment displays the real URL. Do not assume a URL until the run succeeds.
4. Open the actual HTTPS URL in Android Chrome. Test add/edit/complete task, reload, timer, export JSON and import JSON.

**Limits:** Browser-only data; clearing site data or using another device loses access to local tasks. Export JSON regularly and store backups outside the browser. This is not a complete offline-installable PWA: no service worker is included. No production authentication, no cross-device sync. GitHub Actions build must succeed before any claim of working deployment.

**Build check:** The creation environment could not reach npm registry (`EAI_AGAIN`), so dependency installation and build verification are pending GitHub Actions. The workflow uses `npm install` because the existing project has no lockfile. After first successful build, commit a `package-lock.json` and switch to `npm ci` for reproducibility.

## Проверка и исправления для GitHub Pages (v0.1.1)
- Убрана ошибочная настройка npm cache, требовавшая отсутствующий `package-lock.json`.
- GitHub Actions теперь выполняет `npm run typecheck`, статическую сборку, проверяет `out/index.html` и создаёт `.nojekyll`.
- Исправлена ошибка таймера: повторное продолжение после паузы больше не прибавляет время паузы.
- Исправлена запись `started_at` сессии с учётом пауз; добавлено предупреждение при отказе browser storage.
- Для публикации используйте **только GitHub Pages**, без Supabase. В репозиторий нужно загрузить файлы и папку `.github`.
- `NEXT_PUBLIC_BASE_PATH` устанавливается в GitHub Actions автоматически по имени репозитория. Встроенный `manifest.webmanifest` использует относительные пути для `start_url` и `icon.svg`.
- **Важно:** успешная сборка и браузерные проверки пока не подтверждены: в среде подготовки npm install не завершился. GitHub Actions — следующий обязательный этап проверки.
- Для хранения реальных данных используйте экспорт JSON. Эта версия не поддерживает синхронизацию между устройствами.


## v0.1.2 — проверка и исправление (2026-11-16)
- Найдена и исправлена блокирующая синтаксическая ошибка JSX в `src/components/CommandCenter.tsx` (закрытие `categories.map`).
- Повторно проверен синтаксис всех 8 TypeScript/TSX-файлов — 0 синтаксических ошибок.
- Проверены структура архива, JSON-конфигурации, наличие GitHub Actions и настройки `output: export`.
- Полная проверка типов и production-сборка **не выполнены**: зависимости Next.js/React отсутствуют в среде. GitHub Actions должен выполнить их после загрузки репозитория.
- Содержимое пользовательских данных не менялось. Текущая версия предназначена для GitHub Pages без Supabase/Vercel.
- Ссылки на репозиторий, GitHub Actions и опубликованный сайт отсутствуют до создания или определения реального репозитория и успешного деплоя.


## v0.1.3 — ежедневный план из четырёх блоков

Главный экран теперь показывает фиксированный шестичасовой план 150/90/75/45 минут. Отметки сохраняются отдельно по календарной дате Europe/Chisinau в `dailyChecks`; прогресс равен сумме плановых минут отмеченных блоков / 360. Отметки **не** меняют задачи, таймер или фактические минуты.

Существующие JSON-данные сохраняются в прежнем ключе `rgpb-founder-cache-v1`. При первой загрузке старого формата приложение сохраняет исходный JSON под ключом `rgpb-founder-cache-v1-pre-daily-checks` (если его там ещё нет), затем добавляет пустой `dailyChecks`. Перед реальной эксплуатацией выгрузите JSON через кнопку резервной копии на главном экране. Дополнительные функции остались на остальных вкладках.

Время новой даты определяется для часового пояса Europe/Chisinau; при открытом приложении текущий день переключается автоматически, но выбранная вручную историческая дата не перезаписывается.

## v0.1.4 — проверка ежедневного сценария и защита данных (2026-11-17)
- Расчёт 360-минутного плана и переключение отметок вынесены в тестируемую логику `src/lib/daily-plan.ts`.
- Исправлены быстрые повторные нажатия: переключатель использует актуальное состояние даже при пакетной обработке React.
- Навигация по датам не зависит от часового пояса Android и переходов летнего времени.
- Повреждённые или неподдерживаемые записи localStorage больше не заменяются пустыми данными: приложение блокирует запись и показывает предупреждение.
- При перезагрузке таймер не удаляется до завершения восстановления данных.
- Автоматические регрессионные тесты проверяют 0/41,7/66,7/100%, историю нескольких дней, сброс, переключение дат и полуночные границы Europe/Chisinau.
- Блоки остаются независимыми от индивидуальных задач и от фактически отработанных минут.
