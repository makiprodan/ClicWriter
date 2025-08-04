# Script para configurar GitHub Pages
Write-Host "🌐 Configurando GitHub Pages para ClicWriter..." -ForegroundColor Green

# Verificar autenticação
Write-Host "🔐 Verificando autenticação..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro: Faça login primeiro com 'gh auth login'" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Autenticação OK" -ForegroundColor Green

# Verificar se Pages já está ativado
Write-Host "📋 Verificando status do GitHub Pages..." -ForegroundColor Yellow
$pagesStatus = gh api repos/:owner/:repo/pages 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub Pages já está ativado!" -ForegroundColor Green
    $pagesInfo = $pagesStatus | ConvertFrom-Json
    Write-Host "🔗 URL: $($pagesInfo.html_url)" -ForegroundColor Cyan
} else {
    Write-Host "📝 Ativando GitHub Pages..." -ForegroundColor Yellow
    
    # Ativar Pages com source em GitHub Actions
    $enablePages = @{
        source = @{
            branch = "master"
            path = "/"
        }
        build_type = "workflow"
    } | ConvertTo-Json -Depth 3
    
    try {
        gh api --method POST repos/:owner/:repo/pages --input - <<< $enablePages
        Write-Host "✅ GitHub Pages ativado com sucesso!" -ForegroundColor Green
        
        # Aguardar um pouco e verificar novamente
        Start-Sleep -Seconds 5
        $pagesStatus = gh api repos/:owner/:repo/pages 2>$null
        if ($LASTEXITCODE -eq 0) {
            $pagesInfo = $pagesStatus | ConvertFrom-Json
            Write-Host "🔗 URL: $($pagesInfo.html_url)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "⚠️  Erro ao ativar Pages via API. Tentando método alternativo..." -ForegroundColor Yellow
        Write-Host "📝 Acesse manualmente: https://github.com/makiprodan/ClicWriter/settings/pages" -ForegroundColor Cyan
        Write-Host "   1. Source: GitHub Actions" -ForegroundColor White
        Write-Host "   2. Salvar configurações" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🚀 Próximos passos:" -ForegroundColor Green
Write-Host "   1. Commit e push das mudanças" -ForegroundColor White
Write-Host "   2. O deploy será automático via GitHub Actions" -ForegroundColor White
Write-Host "   3. Site estará disponível em: https://makiprodan.github.io/ClicWriter" -ForegroundColor Cyan
Write-Host ""