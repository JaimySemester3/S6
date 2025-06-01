Get-Content .env | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)\s*=\s*(.+)$") {
        $envName = $matches[1].Trim()
        $envValue = $matches[2].Trim('"')
        Set-Item -Path "Env:$envName" -Value $envValue
    }
}

k6 cloud src/tweet-test.js `
  --env AUTH0_DOMAIN=${env:AUTH0_DOMAIN} `
  --env AUTH0_AUDIENCE=${env:AUTH0_AUDIENCE} `
  --env AUTH0_CLIENT_ID=${env:AUTH0_CLIENT_ID} `
  --env AUTH0_CLIENT_SECRET=${env:AUTH0_CLIENT_SECRET}

