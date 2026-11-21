// Crée (ou promeut) un compte administrateur Firebase.
//
// Utilisation :
//   node --env-file=.env.local scripts/create-admin.mjs admin@agence.ci
//   node --env-file=.env.local scripts/create-admin.mjs admin@agence.ci --revoke   (retire le rôle)
//
// Si le compte n'existe pas, il est créé avec un mot de passe aléatoire fort,
// affiché UNE SEULE FOIS : à transmettre à la cliente qui le changera dans Paramètres > Sécurité.
import { randomBytes } from "node:crypto"
import { cert, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const [email, flag] = process.argv.slice(2)
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error("Usage : node --env-file=.env.local scripts/create-admin.mjs <email> [--revoke]")
    process.exit(1)
}

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.error("Variables FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY manquantes dans .env.local")
    process.exit(1)
}

initializeApp({
    credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
})
const auth = getAuth()

if (flag === "--revoke") {
    const user = await auth.getUserByEmail(email)
    await auth.setCustomUserClaims(user.uid, { admin: false })
    await auth.revokeRefreshTokens(user.uid)
    console.log(`Rôle admin retiré et sessions révoquées pour ${email}.`)
    process.exit(0)
}

let user
let password
try {
    user = await auth.getUserByEmail(email)
    console.log(`Compte existant trouvé : ${email}`)
} catch (err) {
    if (err?.code !== "auth/user-not-found") throw err
    password = randomBytes(18).toString("base64url")
    user = await auth.createUser({ email, password, emailVerified: true })
    console.log(`Compte créé : ${email}`)
}

await auth.setCustomUserClaims(user.uid, { admin: true })
console.log("Rôle admin attribué.")
if (password) {
    console.log("\nMot de passe temporaire (affiché une seule fois) :")
    console.log(`  ${password}`)
    console.log("À changer dès la première connexion : Admin > Paramètres > Sécurité.\n")
}
process.exit(0)
