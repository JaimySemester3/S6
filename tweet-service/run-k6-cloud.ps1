k6 cloud src/tweet-test.js `
  --env AUTH0_DOMAIN=$env:AUTH0_DOMAIN `
  --env AUTH0_AUDIENCE=$env:AUTH0_AUDIENCE `
  --env AUTH0_CLIENT_ID=$env:AUTH0_CLIENT_ID `
  --env AUTH0_CLIENT_SECRET=$env:AUTH0_CLIENT_SECRET
