# 🔐 Auth0 Quick Setup Script
# This script helps you generate a secure Auth0 secret

Write-Host "🔐 Auth0 Configuration Helper" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to reconfigure Auth0? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit
    }
} else {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 To complete Auth0 setup, you need:" -ForegroundColor Cyan
Write-Host "1. Auth0 account (free at https://auth0.com)" -ForegroundColor White
Write-Host "2. Create an application in Auth0 Dashboard" -ForegroundColor White
Write-Host "3. Copy your credentials" -ForegroundColor White
Write-Host ""

# Generate secure random string
Write-Host "🔑 Generating secure AUTH0_SECRET..." -ForegroundColor Yellow
$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
Write-Host "✅ Generated: $secret" -ForegroundColor Green
Write-Host ""

# Collect Auth0 credentials
Write-Host "📝 Please enter your Auth0 credentials:" -ForegroundColor Cyan
Write-Host "(Find these in Auth0 Dashboard → Applications → ChatCord → Settings)" -ForegroundColor Yellow
Write-Host ""

$clientId = Read-Host "Auth0 Client ID"
$domain = Read-Host "Auth0 Domain (e.g., dev-abc123.us.auth0.com)"

# Validate domain
if (-not $domain.Contains(".auth0.com")) {
    Write-Host "⚠️  Domain should end with .auth0.com" -ForegroundColor Yellow
}

# Construct issuer URL
$issuerUrl = "https://$domain"

Write-Host ""
Write-Host "📝 Updating .env file..." -ForegroundColor Yellow

# Read current .env
$envContent = Get-Content ".env" -Raw

# Update values
$envContent = $envContent -replace "AUTH0_SECRET='.*'", "AUTH0_SECRET='$secret'"
$envContent = $envContent -replace "AUTH0_CLIENT_ID='.*'", "AUTH0_CLIENT_ID='$clientId'"
$envContent = $envContent -replace "AUTH0_ISSUER_BASE_URL='.*'", "AUTH0_ISSUER_BASE_URL='$issuerUrl'"

# Save
Set-Content ".env" $envContent

Write-Host "✅ .env file updated!" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Auth0 Dashboard: https://manage.auth0.com" -ForegroundColor White
Write-Host "2. Applications → ChatCord → Settings" -ForegroundColor White
Write-Host "3. Add these URLs:" -ForegroundColor White
Write-Host ""
Write-Host "   Allowed Callback URLs:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/callback" -ForegroundColor White
Write-Host ""
Write-Host "   Allowed Logout URLs:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "   Allowed Web Origins:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "4. Save Changes in Auth0" -ForegroundColor White
Write-Host "5. Run: npm run dev" -ForegroundColor White
Write-Host "6. Visit: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "📚 For detailed instructions, see: AUTH0_SETUP.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Setup complete! Start your server with: npm run dev" -ForegroundColor Green
