// ── environment.ts ────────────────────────────────────────────────────────────
// Este archivo SÍ va al repositorio. Solo contiene valores neutrales o de ejemplo.
// Los valores reales van en environment.development.ts y environment.prod.ts,
// ambos ignorados por .gitignore.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'   // sobreescribe en cada environment real
};
