# Compile Academic Poster
# This script compiles the poster without needing Perl or latexmk

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Compiling Academic Poster" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# First compilation
Write-Host "Running first pdflatex pass..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode academic_poster.tex

# Second compilation (for references and cross-references)
Write-Host "Running second pdflatex pass..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode academic_poster.tex

# Check if PDF was created
if (Test-Path "academic_poster.pdf") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Poster compiled successfully" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "PDF file: academic_poster.pdf" -ForegroundColor White
    
    # Open the PDF
    Write-Host ""
    $response = Read-Host "Open PDF now? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        Start-Process "academic_poster.pdf"
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR: PDF was not created" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check academic_poster.log for details" -ForegroundColor Yellow
}

# Clean up auxiliary files (optional)
Write-Host ""
$cleanup = Read-Host "Clean up auxiliary files (.aux, .log, .out, etc.)? (Y/N)"
if ($cleanup -eq "Y" -or $cleanup -eq "y") {
    Remove-Item -Path "*.aux", "*.log", "*.out", "*.nav", "*.snm", "*.toc" -ErrorAction SilentlyContinue
    Write-Host "Auxiliary files cleaned!" -ForegroundColor Green
}
