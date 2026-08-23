$base = "https://bakeryhub-app.vercel.app/api"

Write-Host "1. Admin Login"
$r = Invoke-WebRequest "$base/auth/login" -Method POST -Body '{"email":"admin@bakehub.com","password":"admin123","role":"admin"}' -ContentType "application/json" -UseBasicParsing
$token = ($r.Content | ConvertFrom-Json).token
Write-Host "Token obtained: $($token.Substring(0, 20))..."

Write-Host "`n2. Bakeries Public (GET /api/bakeries/public)"
try {
    $r4 = Invoke-WebRequest "$base/bakeries/public" -UseBasicParsing
    Write-Host "Status: $($r4.StatusCode)"
    Write-Host "Body: $($r4.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Host "Details: $($_.ErrorDetails.Message)" }
}

Write-Host "`n3. Bakeries Admin (GET /api/bakeries)"
try {
    $headers = @{ "Authorization" = "Bearer $token" }
    $r3 = Invoke-WebRequest "$base/bakeries" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($r3.StatusCode)"
    Write-Host "Body: $($r3.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails) { Write-Host "Details: $($_.ErrorDetails.Message)" }
}
