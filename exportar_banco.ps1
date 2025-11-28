# Configurações (Baseado no seu .env local)
$dbUser = "root"
$dbPass = "" # Geralmente vazio no XAMPP, se tiver senha, coloque aqui
$dbName = "agency_crm"
$outputFile = "backup_banco.sql"

# Tenta encontrar o mysqldump (comum no XAMPP)
$mysqldump = "C:\xampp\mysql\bin\mysqldump.exe"

if (-not (Test-Path $mysqldump)) {
    Write-Host "mysqldump não encontrado no caminho padrão do XAMPP." -ForegroundColor Yellow
    Write-Host "Tentando usar 'mysqldump' do sistema..."
    $mysqldump = "mysqldump"
}

Write-Host "Exportando banco de dados '$dbName' para '$outputFile'..." -ForegroundColor Cyan

try {
    # Comando para exportar
    & $mysqldump -u $dbUser $dbName > $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Sucesso! Arquivo criado: $outputFile" -ForegroundColor Green
        Write-Host "Envie este arquivo para seu amigo importar no servidor." -ForegroundColor Green
    }
    else {
        Write-Host "Erro ao exportar. Verifique se o MySQL está rodando." -ForegroundColor Red
    }
}
catch {
    Write-Host "Erro ao executar mysqldump. Verifique se o MySQL/XAMPP está instalado e rodando." -ForegroundColor Red
    Write-Host "Erro detalhado: $_" -ForegroundColor Red
}
