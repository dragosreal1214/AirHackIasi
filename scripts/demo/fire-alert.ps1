# Fogora demo - trigger a disruption alert.
#   .\fire-alert.ps1                       -> proactive scan (force_fog=IAS), alerts all at-risk passengers
#   .\fire-alert.ps1 -Phone "+40770675731" -> one targeted alert (push/WhatsApp/SMS) for a number
param(
  [string]$Phone,
  [string]$Disruption = "d_001",
  [string]$Api = "http://127.0.0.1:8000"
)

$ErrorActionPreference = "Stop"
try {
  if ($Phone) {
    $body = @{ phoneNumber = $Phone; disruptionId = $Disruption; channels = @("push", "whatsapp", "sms") } | ConvertTo-Json
    Write-Host "-> Sending alert to $Phone (disruption $Disruption)..." -ForegroundColor Yellow
    $res = Invoke-RestMethod -Method Post "$Api/api/v1/dev/send-notification" -ContentType "application/json" -Body $body
  }
  else {
    Write-Host "-> Running proactive scan (force_fog=IAS)..." -ForegroundColor Yellow
    $res = Invoke-RestMethod -Method Post "$Api/api/v1/dev/run-monitor?force_fog=IAS"
  }
  $res | ConvertTo-Json -Depth 6
  Write-Host "OK." -ForegroundColor Green
}
catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  Check that the API is running: $Api/health" -ForegroundColor DarkGray
}
