# ChatCord Deployment Script for Windows
# Run this script to prepare and push your code to GitHub

Write-Host "🚀 ChatCord - Render Deployment Preparation" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

Write-Host ""

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Found changes to commit..." -ForegroundColor Yellow
    
    # Show status
    git status --short
    
    Write-Host ""
    $commit = Read-Host "Enter commit message (or press Enter for default)"
    
    if ([string]::IsNullOrWhiteSpace($commit)) {
        $commit = "Prepare ChatCord for Render deployment with PostgreSQL"
    }
    
    Write-Host ""
    Write-Host "📦 Adding files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m $commit
    
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✅ No changes to commit" -ForegroundColor Green
}

Write-Host ""

# Check for remote
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "⚠️  No remote repository configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://github.com/new" -ForegroundColor White
    Write-Host "2. Create a new repository named 'ChatCord'" -ForegroundColor White
    Write-Host "3. Do NOT initialize with README" -ForegroundColor White
    Write-Host "4. Copy the repository URL" -ForegroundColor White
    Write-Host ""
    
    $repoUrl = Read-Host "Enter your GitHub repository URL"
    
    if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host ""
        Write-Host "🔗 Adding remote..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        Write-Host "✅ Remote added" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Remote repository: $remote" -ForegroundColor Green
}

Write-Host ""

# Check current branch
$branch = git branch --show-current
Write-Host "📍 Current branch: $branch" -ForegroundColor Cyan

if ($branch -ne "main" -and $branch -ne "master") {
    Write-Host "⚠️  Warning: Not on main/master branch" -ForegroundColor Yellow
    $switchBranch = Read-Host "Switch to 'main' branch? (y/n)"
    
    if ($switchBranch -eq "y") {
        git branch -M main
        Write-Host "✅ Switched to main branch" -ForegroundColor Green
        $branch = "main"
    }
}

Write-Host ""

# Ask to push
$push = Read-Host "Push to GitHub now? (y/n)"

if ($push -eq "y") {
    Write-Host ""
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    
    try {
        git push -u origin $branch
        Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Push failed. You may need to set up authentication." -ForegroundColor Red
        Write-Host "See: https://docs.github.com/en/authentication" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://dashboard.render.com/select-repo?type=blueprint" -ForegroundColor White
    Write-Host "2. Select your ChatCord repository" -ForegroundColor White
    Write-Host "3. Click 'Apply'" -ForegroundColor White
    Write-Host "4. Wait 3-5 minutes for deployment" -ForegroundColor White
    Write-Host "5. Your app will be live! 🎊" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "📝 To push manually, run:" -ForegroundColor Cyan
    Write-Host "git push -u origin $branch" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "- QUICKSTART.md (fastest way)" -ForegroundColor White
Write-Host "- DEPLOY_GUIDE.md (step-by-step)" -ForegroundColor White
Write-Host "- RENDER_DEPLOYMENT.md (complete reference)" -ForegroundColor White

Write-Host ""
Write-Host "✅ Preparation complete!" -ForegroundColor Green
Write-Host ""
