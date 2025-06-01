const dotenv = require('dotenv');
const { execSync } = require('child_process');
const path = require('path');

dotenv.config();

const {
  AUTH0_DOMAIN,
  AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
} = process.env;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
  console.error("Missing one or more required environment variables in .env.");
  process.exit(1);
}

const testPath = path.join('src', 'tweet-test.js');

const command = [
  'k6 run',
  `--env AUTH0_DOMAIN=${AUTH0_DOMAIN}`,
  `--env AUTH0_AUDIENCE=${AUTH0_AUDIENCE}`,
  `--env AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}`,
  `--env AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}`,
  testPath
].join(' ');

console.log('Running K6 with environment variables from .env...\n');
execSync(command, { stdio: 'inherit' });
