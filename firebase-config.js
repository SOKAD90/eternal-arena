const firebaseConfig = {
	apiKey: "FIREBASE_API_KEY",
	authDomain: "FIREBASE_AUTH_DOMAIN",
	projectId: "FIREBASE_PROJECT_ID",
	storageBucket: "FIREBASE_STORAGE_BUCKET",
	messagingSenderId: "FIREBASE_MESSAGING_SENDER_ID",
	appId: "FIREBASE_APP_ID",
	databaseURL: "FIREBASE_DATABASE_URL"
}

const unresolvedEntry = Object.entries(firebaseConfig).find(([, value]) =>
	typeof value === "string" && value.startsWith("FIREBASE_")
)

if (unresolvedEntry) {
	throw new Error(
		"Firebase config placeholders are still present. Run the build so firebase-config.js is generated from env vars, and make sure Netlify publishes the built output or uses the repo build command."
	)
}

export { firebaseConfig }