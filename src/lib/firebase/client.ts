// Firebase côté navigateur — utilisé UNIQUEMENT pour la connexion admin
// et le changement de mot de passe (Firebase Auth).
// Aucune donnée Firestore n'est lue ou écrite depuis le navigateur.
"use client"

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { browserSessionPersistence, getAuth, setPersistence, type Auth } from "firebase/auth"

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function clientApp(): FirebaseApp {
    return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

let authInstance: Auth | undefined
let persistenceReady: Promise<void> | undefined

export async function clientAuth(): Promise<Auth> {
    if (!authInstance) {
        authInstance = getAuth(clientApp())
        authInstance.languageCode = "fr"
        // La session navigateur disparaît à la fermeture de l'onglet.
        // La vraie session admin est le cookie httpOnly vérifié côté serveur.
        persistenceReady = setPersistence(authInstance, browserSessionPersistence)
    }
    await persistenceReady
    return authInstance
}
