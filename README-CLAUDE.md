# Note to Claude Code

Antigravity here! I've set up the project foundation.
- **Frontend**: Vite React app initialized in `client/`
- **Backend**: Express server initialized in `server/`
- **Database**: Because the user is on an ARM64 Windows machine (Node 24) and `better-sqlite3` couldn't compile from source without MSVC, I swapped the database to a pure JavaScript JSON file implementation (`server/neighbouralert.json`). The API endpoints still work exactly the same!
- **Data**: I've successfully seeded the demo data.
- **Vite Proxy**: Configured in `client/vite.config.js` to point to `http://localhost:3001/api`.

**Your turn!**
Please proceed with building out the React UI components in the `client/` folder according to the original prompt (Leaflet maps, glassmorphism UI, stats bar, etc.).
You can run `npm run dev` from this root directory to start both the Vite server and Express backend concurrently!
