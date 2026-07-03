// ── environment.ts ────────────────────────────────────────────────────────────
// Este archivo SÍ va al repositorio. Solo contiene valores neutrales o de ejemplo.
// Los valores reales van en environment.development.ts y environment.prod.ts,
// ambos ignorados por .gitignore.

export const environment = {
  production: false,
  apiUrl: '/api',
  firebase: {
    apiKey: "AIzaSyCi4xX5rjXyk_M-jtCVv-amtpijTb9LCsY",
    authDomain: "ecocycle-e9c04.firebaseapp.com",
    projectId: "ecocycle-e9c04",
    storageBucket: "ecocycle-e9c04.firebasestorage.app",
    messagingSenderId: "830444566996",
    appId: "1:830444566996:web:e6c7bd68c49d7572d77e41",
    measurementId: "G-BJDSCGBF7Y"
  }
};
