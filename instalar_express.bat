@echo off
title Instalador Express (XAMPP)
color 0A

echo =================================================
echo    INSTALADOR AUTOMATICO (PARA XAMPP)
echo =================================================
echo.
echo Certifique-se que o XAMPP esta aberto e o MySQL rodando (Start).
echo.
pause

echo.
echo Instalando dependencias...
call npm install

echo.
echo Configurando banco de dados...
node setup_xampp.js

echo.
pause
