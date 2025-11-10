#!/usr/bin/env node

/**
 * Generate Angular environment files from .env files
 * This script reads .env files and generates the corresponding environment.ts files
 */

const fs = require('fs');
const path = require('path');

// Map of environment names to their .env file and output file
const envConfigs = {
  local: {
    envFile: '.env',
    outputFile: 'src/environments/environment.local.ts',
    production: false,
    useEmulators: true,
    environment: 'local',
  },
  dev: {
    envFile: '.env.dev',
    outputFile: 'src/environments/environment.dev.ts',
    production: false,
    useEmulators: false,
    environment: 'dev',
  },
  prod: {
    envFile: '.env.production',
    outputFile: 'src/environments/environment.prod.ts',
    production: true,
    useEmulators: false,
    environment: 'prod',
  },
  default: {
    envFile: '.env',
    outputFile: 'src/environments/environment.ts',
    production: false,
    useEmulators: false,
    environment: 'dev',
  },
};

/**
 * Parse .env file and return key-value pairs
 */
function parseEnvFile(envFilePath) {
  const envPath = path.join(__dirname, '..', envFilePath);
  
  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Warning: ${envFilePath} not found, using defaults`);
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    line = line.trim();
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      return;
    }

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

/**
 * Generate environment.ts file content
 */
function generateEnvFile(config, envVars) {
  const {
    production,
    useEmulators,
    environment,
  } = config;

  const apiKey = envVars.FIREBASE_API_KEY || '';
  const authDomain = envVars.FIREBASE_AUTH_DOMAIN || '';
  const projectId = envVars.FIREBASE_PROJECT_ID || '';
  const storageBucket = envVars.FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = envVars.FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = envVars.FIREBASE_APP_ID || '';
  const measurementId = envVars.FIREBASE_MEASUREMENT_ID || '';
  const version = envVars.APP_VERSION || '0.0.0';

  const envName = environment === 'prod' ? 'production' : environment;
  const comment = environment === 'prod'
    ? 'Production environment'
    : environment === 'local'
    ? 'Local development environment with Firebase Emulators'
    : environment === 'dev'
    ? 'Development environment with live Firebase'
    : 'Default environment (fallback)';

  return `/**
 * ${comment}
 * This file is auto-generated from ${config.envFile}
 * DO NOT EDIT MANUALLY - Run 'npm run generate-env' to regenerate
 */
export const environment = {
  production: ${production},
  useEmulators: ${useEmulators},${environment === 'local' ? ' // Use local Firebase emulators' : environment === 'prod' ? ' // Always false in production' : ' // Use real Firebase (dev project)'}
  environment: '${environment}',
  version: '${version}',
  firebase: {
    apiKey: '${apiKey}',
    authDomain: '${authDomain}',
    projectId: '${projectId}',
    storageBucket: '${storageBucket}',
    messagingSenderId: '${messagingSenderId}',
    appId: '${appId}',
    measurementId: '${measurementId}',
  },
};
`;
}

/**
 * Main function
 */
function main() {
  const envName = process.argv[2] || 'all';
  const projectRoot = path.join(__dirname, '..');

  // Ensure environments directory exists
  const envDir = path.join(projectRoot, 'src', 'environments');
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  const configsToProcess = envName === 'all'
    ? Object.entries(envConfigs)
    : envConfigs[envName]
    ? [[envName, envConfigs[envName]]]
    : [];

  if (configsToProcess.length === 0) {
    console.error(`❌ Error: Unknown environment "${envName}"`);
    console.log('Usage: node generate-env.js [local|dev|prod|all]');
    process.exit(1);
  }

  console.log('🔄 Generating environment files from .env files...\n');

  configsToProcess.forEach(([name, config]) => {
    const envVars = parseEnvFile(config.envFile);
    const content = generateEnvFile(config, envVars);
    const outputPath = path.join(projectRoot, config.outputFile);

    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ Generated ${config.outputFile} from ${config.envFile}`);
  });

  console.log('\n✨ Environment files generated successfully!');
}

main();

