import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")
const distDir = path.join(rootDir, "dist")
const nodeEnv = process.env.NODE_ENV || "production"

loadDotEnvFiles([
  path.join(rootDir, ".env"),
  path.join(rootDir, `.env.${nodeEnv}`),
  path.join(rootDir, ".env.local"),
  path.join(rootDir, `.env.${nodeEnv}.local`)
])

const projectId = readEnv("FIREBASE_PROJECT_ID", "VITE_FIREBASE_PROJECT_ID")

const firebaseConfig = {
  apiKey: readEnv("FIREBASE_API_KEY", "VITE_FIREBASE_API_KEY"),
  authDomain: readEnv("FIREBASE_AUTH_DOMAIN", "VITE_FIREBASE_AUTH_DOMAIN"),
  projectId,
  storageBucket: readEnv("FIREBASE_STORAGE_BUCKET", "VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("FIREBASE_MESSAGING_SENDER_ID", "VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("FIREBASE_APP_ID", "VITE_FIREBASE_APP_ID"),
  databaseURL: readDatabaseUrl(projectId)
}

rmSync(distDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })

for (const entry of readdirSync(rootDir)) {
  if (shouldSkip(entry)) {
    continue
  }

  const sourcePath = path.join(rootDir, entry)
  const targetPath = path.join(distDir, entry)
  const sourceStats = statSync(sourcePath)

  if (sourceStats.isDirectory()) {
    cpSync(sourcePath, targetPath, { recursive: true })
  } else {
    copyFileSync(sourcePath, targetPath)
  }
}

writeFileSync(
  path.join(distDir, "firebase-config.js"),
  `${renderFirebaseModule(firebaseConfig)}\n`,
  "utf8"
)

if (process.env.NETLIFY || process.env.CI) {
  writeFileSync(
    path.join(rootDir, "firebase-config.js"),
    `${renderFirebaseModule(firebaseConfig)}\n`,
    "utf8"
  )
}

console.log("Built Netlify bundle in dist/")

function shouldSkip(entry) {
  return new Set([
    ".env",
    ".env.example",
    ".gitignore",
    ".git",
    ".github",
    "README.md",
    "dist",
    "firebase-config.js",
    "netlify.toml",
    "node_modules",
    "package-lock.json",
    "package.json",
    "scripts"
  ]).has(entry)
}

function readEnv(primaryKey, fallbackKey) {
  const value = process.env[primaryKey] || process.env[fallbackKey]

  if (!value) {
    throw new Error(
      `Missing required Firebase environment variable. Set ${primaryKey} or ${fallbackKey}.`
    )
  }

  return value
}

function readDatabaseUrl(projectId) {
  const explicitValue = process.env.FIREBASE_DATABASE_URL || process.env.VITE_FIREBASE_DATABASE_URL

  if (explicitValue) {
    return explicitValue
  }

  return `https://${projectId}-default-rtdb.firebaseio.com`
}

function renderFirebaseModule(config) {
  return `export const firebaseConfig = ${JSON.stringify(config, null, 2)}`
}

function loadDotEnvFiles(filePaths) {
  for (const filePath of filePaths) {
    loadDotEnv(filePath)
  }
}

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/)

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line || line.startsWith("#")) {
      continue
    }

    const separatorIndex = line.indexOf("=")

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).replace(/^export\s+/, "").trim()
    const value = stripQuotes(line.slice(separatorIndex + 1).trim())

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}