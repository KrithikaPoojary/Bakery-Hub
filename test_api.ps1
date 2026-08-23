$base = "https://bakeryhub-app.vercel.app/api"

Write-Host "Admin Login Test"
try {
    $r = Invoke-WebRequest "$base/auth/login" -Method POST -Body '{"email":"admin@bakehub.com","password":"admin123","role":"admin"}' -ContentType "application/json" -UseBasicParsing
    Write-Host "OK: $($r.Content)"
} catch { Write-Host "FAIL: $($_.ErrorDetails.Message)" }
