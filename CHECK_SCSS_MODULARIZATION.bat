@echo off
REM ==================== SCSS MODULARIZATION VERIFICATION ====================
REM Windows PowerShell Script to verify SCSS modularization and compile

echo.
echo ==========================================
echo SCSS MODULARIZATION - VERIFICATION PHASE
echo ==========================================
echo.

setlocal enabledelayedexpansion

REM Define paths
set SCSS_DIR=public\scss
set STYLES_DIR=public\styles
set ORIGINAL_CSS=%STYLES_DIR%\admin.css
set OUTPUT_CSS=%STYLES_DIR%\admin-compiled.css
set OUTPUT_MIN_CSS=%STYLES_DIR%\admin-compiled.min.css

REM Step 1: Verify SCSS files
echo [1/5] Verifying SCSS files...
set FILES_MISSING=0

if not exist "%SCSS_DIR%\_variables.scss" (
    echo [ERROR] Missing: _variables.scss
    set /a FILES_MISSING+=1
) else echo [OK] _variables.scss

if not exist "%SCSS_DIR%\_global.scss" (
    echo [ERROR] Missing: _global.scss
    set /a FILES_MISSING+=1
) else echo [OK] _global.scss

if not exist "%SCSS_DIR%\_utilities.scss" (
    echo [ERROR] Missing: _utilities.scss
    set /a FILES_MISSING+=1
) else echo [OK] _utilities.scss

if not exist "%SCSS_DIR%\_layout.scss" (
    echo [ERROR] Missing: _layout.scss
    set /a FILES_MISSING+=1
) else echo [OK] _layout.scss

if not exist "%SCSS_DIR%\_navbar.scss" (
    echo [ERROR] Missing: _navbar.scss
    set /a FILES_MISSING+=1
) else echo [OK] _navbar.scss

if not exist "%SCSS_DIR%\_forms.scss" (
    echo [ERROR] Missing: _forms.scss
    set /a FILES_MISSING+=1
) else echo [OK] _forms.scss

if not exist "%SCSS_DIR%\_search.scss" (
    echo [ERROR] Missing: _search.scss
    set /a FILES_MISSING+=1
) else echo [OK] _search.scss

if not exist "%SCSS_DIR%\_buttons.scss" (
    echo [ERROR] Missing: _buttons.scss
    set /a FILES_MISSING+=1
) else echo [OK] _buttons.scss

if not exist "%SCSS_DIR%\_tables.scss" (
    echo [ERROR] Missing: _tables.scss
    set /a FILES_MISSING+=1
) else echo [OK] _tables.scss

if not exist "%SCSS_DIR%\_cards.scss" (
    echo [ERROR] Missing: _cards.scss
    set /a FILES_MISSING+=1
) else echo [OK] _cards.scss

if not exist "%SCSS_DIR%\_estaciones.scss" (
    echo [ERROR] Missing: _estaciones.scss
    set /a FILES_MISSING+=1
) else echo [OK] _estaciones.scss

if not exist "%SCSS_DIR%\_ofertas.scss" (
    echo [ERROR] Missing: _ofertas.scss
    set /a FILES_MISSING+=1
) else echo [OK] _ofertas.scss

if not exist "%SCSS_DIR%\_cierres.scss" (
    echo [ERROR] Missing: _cierres.scss
    set /a FILES_MISSING+=1
) else echo [OK] _cierres.scss

if not exist "%SCSS_DIR%\admin.scss" (
    echo [ERROR] Missing: admin.scss (master file)
    set /a FILES_MISSING+=1
) else echo [OK] admin.scss (master file)

if !FILES_MISSING! GTR 0 (
    echo.
    echo [FAILED] !FILES_MISSING! SCSS files are missing
    exit /b 1
)

echo.
echo All SCSS files verified successfully!
echo.

REM Step 2: Count lines
echo [2/5] Analyzing SCSS files...
set TOTAL_LINES=0
for %%f in (%SCSS_DIR%\_*.scss) do (
    for /f %%L in ('find /c /v "" ^< "%%f"') do (
        set /a TOTAL_LINES+=%%L
    )
)
echo Total SCSS lines: !TOTAL_LINES!
echo.

REM Step 3: Check for sass compiler
echo [3/5] Checking for sass compiler...
where sass >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] sass compiler found
    echo.
    
    REM Step 4: Compile SCSS
    echo [4/5] Compiling SCSS to CSS...
    call sass "%SCSS_DIR%\admin.scss" "%OUTPUT_CSS%" --style=expanded
    
    if exist "%OUTPUT_CSS%" (
        echo [OK] Compilation successful
        for /f %%s in ('powershell -Command "(Get-Item '%OUTPUT_CSS%').Length / 1MB"') do set SIZE=%%s
        echo File size: !SIZE! MB
        echo Output: %OUTPUT_CSS%
        echo.
        
        REM Create minified version
        echo [5/5] Creating minified version...
        call sass "%SCSS_DIR%\admin.scss" "%OUTPUT_MIN_CSS%" --style=compressed
        
        if exist "%OUTPUT_MIN_CSS%" (
            echo [OK] Minified version created
            for /f %%s in ('powershell -Command "(Get-Item '%OUTPUT_MIN_CSS%').Length / 1MB"') do set MINSIZE=%%s
            echo Minified size: !MINSIZE! MB
            echo.
        ) else (
            echo [WARNING] Failed to create minified version
            echo.
        )
        
        echo ==========================================
        echo SCSS COMPILATION SUCCESSFUL
        echo ==========================================
        echo.
        echo Next Steps:
        echo 1. Update HTML links to use: /styles/admin-compiled.css
        echo 2. For production, use: /styles/admin-compiled.min.css
        echo 3. Test all components in browser
        echo 4. Run responsive design tests
        echo.
        echo ==========================================
    ) else (
        echo [ERROR] Compilation failed
        exit /b 1
    )
) else (
    echo [WARNING] sass compiler not found
    echo.
    echo Install sass with:
    echo   npm install -g sass
    echo Or:
    echo   npm install sass --save-dev
    echo.
    echo Then run compilation:
    echo   sass %SCSS_DIR%\admin.scss %OUTPUT_CSS%
    echo.
    echo For minified version:
    echo   sass %SCSS_DIR%\admin.scss %OUTPUT_MIN_CSS% --style=compressed
    echo.
)

echo.
echo Verification complete!
echo.

endlocal
