$base = "https://bakeryhub-app.vercel.app/api"

Write-Host "1. Health (check mongo/jwt env vars)"
$r = Invoke-WebRequest "$base/health" -UseBasicParsing
Write-Host $r.Content

Write-Host "`n2. Admin Login"
try {
    $r2 = Invoke-WebRequest "$base/auth/login" -Method POST -Body '{"email":"admin@bakehub.com","password":"admin123","role":"admin"}' -ContentType "application/json" -UseBasicParsing
    Write-Host "OK: $($r2.Content.Substring(0,200))"
} catch { Write-Host "FAIL: $($_.ErrorDetails.Message)" }
