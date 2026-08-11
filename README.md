# Workout Planner

A local, single-user workout and diet tracker: build workout templates, log
sessions from them with automatic personal-record detection, track daily
food and body weight, see analytics, and export a PDF report. Everything is
stored locally in a PostgreSQL database - nothing leaves your machine.

## For Windows users (no coding experience needed)

No Docker, no WSL - just double-click and wait.

1. Download this repository (green "Code" button on GitHub -> "Download ZIP"), then unzip it. Or, if you have Git, `git clone` it.
2. Open the `scripts\windows` folder.
3. Double-click **`Install.bat`**.
4. Click "Yes" if Windows asks for permission. Then just wait - it installs everything it needs (Node.js, PostgreSQL) and sets the app up. This can take several minutes the first time.
5. When it finishes, your browser opens automatically to the app.

That's it - it also sets itself to start automatically every time you log in (and PostgreSQL runs as its own Windows service that starts on its own too), so you never need to run anything again. To turn that off later, double-click `scripts\windows\Uninstall.bat`.

## For development

Requirements: Node.js 20+, Docker.

```bash
docker compose up -d        # start Postgres
npm install
npx prisma migrate dev      # create the database tables
npm run dev                 # start the dev server at http://localhost:3000
```

Useful scripts:

```bash
npm run dev:stop            # stop whatever's running on port 3000
npm run build && npm run start   # production build/run
npx prisma studio           # browse the database in a UI
```

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, PostgreSQL via Prisma, Next.js API routes as the backend called from React via `fetch`, recharts for analytics, jsPDF for report export.
