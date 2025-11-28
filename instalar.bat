@echo off
title Instalador Agency CRM
color 0A

echo =================================================
echo    BEM-VINDO AO INSTALADOR DO AGENCY CRM
echo =================================================
echo.
echo Verificando dependencias...
echo.

call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar dependencias. Verifique se o Node.js esta instalado.
    pause
    exit /b
)

echo.
echo Dependencias instaladas. Iniciando configurador...
echo.

node setup.js

pause
