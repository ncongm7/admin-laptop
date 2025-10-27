## Quick context for AI code helpers

This Vue 3 + Vite admin frontend uses Pinia for state and axios for backend calls. Use these notes to be productive quickly and avoid breaking common app assumptions.

Core locations
- App bootstrap: `src/main.js` (Pinia + router registered)
- Router and guards: `src/router/router.js` (routes use dynamic imports and `meta.requiresAuth` / `meta.hideForAuth`)
- Auth store: `src/stores/authStore.js` (key flows: `login`, `logout`, `checkAuthStatus`, `initialize`)
- HTTP client: `src/service/axiosInstance.js` (baseURL `http://localhost:8080`, Authorization header set on login)
- Services: `src/service/*.js` (API wrappers, e.g. `authService.js`)

Build / dev commands
- Start dev server: `npm run dev` (Vite)
- Build production: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`

Important patterns & conventions (use these precisely)
- Route protection: routes default to requiring auth unless `meta.requiresAuth` is explicitly `false`. Routes that should be inaccessible when authenticated use `meta.hideForAuth: true`. See `src/router/router.js` for examples.
- Lazy loading: Components are imported with dynamic imports (e.g. `() => import('@/views/SomeView.vue')`). Follow that pattern for new routes.
- Auth contract: `authStore.login(credentials)` expects an object with `{ tenDangNhap, matKhau }`. The store expects the backend response to contain `token` and `user` (store code tolerates `response.data` wrappers). On successful login the store saves `token` and `user` to both state and `localStorage`, and sets `axiosInstance.defaults.headers.common['Authorization'] = 'Bearer <token>'`.
- LocalStorage keys to preserve: `token`, `user`, `userId`, `currentNhanVienId`. Avoid renaming them without updating the store and code that reads them.
- API client: Use `src/service/axiosInstance.js` instead of creating new axios instances so Authorization headers and baseURL remain consistent.
- Stores location: put Pinia stores under `src/stores/` and export with `defineStore`. Use the existing `useAuthStore` naming pattern.

Examples (copy/paste friendly)
- Set Authorization header after login:
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
- Guard check pattern (follow existing style in `router.js`):
  - Initialize auth store from localStorage when `authStore.token === null` and `localStorage.getItem('token')` exists.
  - Redirect to `/login` when route requires auth and `!authStore.isAuthenticated`.

What to watch out for
- The app uses path alias `@` (see `jsconfig.json`). Use `@/` imports for consistency.
- Backend base URL is `http://localhost:8080` in `axiosInstance.js`. Don't hardcode other endpoints elsewhere; add changes centrally.
- The codebase expects certain user fields (e.g. `userId`, `hoTen`, `tenDangNhap`) — be tolerant when reading fields (existing getters check multiple possible keys).

If you update or add auth flows, update these files: `src/service/authService.js`, `src/stores/authStore.js`, and any routes in `src/router/router.js`.

If anything here is unclear or a section is missing (e.g., CI, external services, or test commands), tell me which area you'd like expanded and I'll update this file.
