@echo off
echo Iniciando servidores...

REM Iniciar backend con uvicorn
start cmd /k "cd backend && uvicorn main:app --reload"

REM Iniciar frontend con npm start
start cmd /k "cd reactjs && npm start"

echo Servidores iniciados.
