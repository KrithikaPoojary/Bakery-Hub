$base = "https://bakeryhub-app.vercel.app/api"

Write-Host "1. Admin Login"
try {
    $r = Invoke-WebRequest "$base/auth/login" -Method POST -Body '{"email":"admin@bakehub.com","password":"admin123","role":"admin"}' -ContentType "application/json" -UseBasicParsing
    $token = ($r.Content | ConvertFrom-Json).token
    Write-Host "OK - token received"
} catch { Write-Host "FAIL: $($_.ErrorDetails.Message)"; exit }

Write-Host "`n2. Send Register OTP"
$ts = [int](Get-Date -UFormat %s)
$email = "test$ts@yopmail.com"
try {
    $r2 = Invoke-WebRequest "$base/auth/send-register-otp" -Method POST -Body "{`"email`":`"$email`"}" -ContentType "application/json" -UseBasicParsing
    Write-Host "OK: $($r2.Content)"
} catch { Write-Host "FAIL: $($_.ErrorDetails.Message)" }

Write-Host "`n3. Bakeries (admin token)"
try {
    $r3 = Invoke-WebRequest "$base/bakeries" -Headers @{Authorization="Bearer $token"} -UseBasicParsing
    Write-Host "OK ($($r3.StatusCode)): $($r3.Content.Substring(0,100))"
} catch { Write-Host "FAIL: $($_.ErrorDetails.Message)" }

Write-Host "`n4. Bakeries Public"
try {
    $r4 = Invoke-WebRequest "$base/bakeries/public" -UseBasicParsing
    Write-Host "OK ($($r4.StatusCode)): $($r4.Content.Substring(0,100))"
} catch { Write-Host "FAIL: $($_.ErrorDetails.Message)" }

Write-Host "`nAll done!"
