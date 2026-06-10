import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // <-- TRAE ESTA LÍNEA
import { routes } from './app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

const firebaseConfig = {
  apiKey: "AIzaSyCi4xX5rjXyk_M-jtCVv-amtpijTb9LCsY",
  authDomain: "ecocycle-e9c04.firebaseapp.com",
  projectId: "ecocycle-e9c04", 
  storageBucket: "ecocycle-e9c04.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(), // <-- AGREGA ESTO AQUÍ
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]
};