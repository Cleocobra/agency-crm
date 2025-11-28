$source = Get-Location
$destination = "agency-crm-deploy.zip"
$exclude = @("node_modules", ".next", ".git", ".vscode", "tmp", "*.zip", "*.log")

Write-Host "Criando arquivo ZIP para deploy..." -ForegroundColor Cyan

# Remove zip antigo se existir
if (Test-Path $destination) {
    Remove-Item $destination
}

# Lista arquivos para incluir
$files = Get-ChildItem -Path $source -Exclude $exclude

# Cria o zip
Compress-Archive -Path $files -DestinationPath $destination -CompressionLevel Optimal

Write-Host "Arquivo '$destination' criado com sucesso!" -ForegroundColor Green
Write-Host "Envie este arquivo e o 'INSTRUCOES_TECNICAS.md' para o responsavel." -ForegroundColor Yellow
