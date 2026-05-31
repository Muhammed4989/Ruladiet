$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$stagingUrl = 'https://wordpress-733947-6451423.cloudwaysapps.com'
$user = 'dietitianrula@gmail.com'
$appPass = 'TJ8X WR4g dV3O sQnX sAam mOFq'
$pair = "$user`:$appPass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

# Get current homepage
$json = Get-Content 'C:\Users\moham\ruladiet-site\homepage_current.json' -Raw -Encoding UTF8
$obj = $json | ConvertFrom-Json
$c = $obj.content.rendered

# Build override CSS - scoped to page-id-15
$overrideCss = '<style>.page-id-15 .wd-content-layout.content-layout-wrapper.container,.page-id-15 .wd-content-area.site-content,.page-id-15 .entry-content{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important}.page-id-15 .wd-page-title{display:none!important}.page-id-15 .wd-content-layout.content-layout-wrapper.container>.container,.page-id-15 .wd-content-area>.container{padding:0!important}</style>'

# Prepend to content
$newContent = $overrideCss + $c

# Build JSON payload
$body = @{content=$newContent} | ConvertTo-Json -Depth 3 -Compress

# Write to file with UTF8 no BOM
$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
$payloadFile = 'C:\Users\moham\ruladiet-site\payload_hp_fix.json'
[System.IO.File]::WriteAllText($payloadFile, $body, $Utf8NoBom)

Write-Output "Payload written: $((Get-Item $payloadFile).Length) bytes"

# Send via System.Net.WebRequest
$payloadBytes = [System.IO.File]::ReadAllBytes($payloadFile)
$req = [System.Net.WebRequest]::CreateHttp("$stagingUrl/wp-json/wp/v2/pages/15")
$req.Method = 'PUT'
$req.ContentType = 'application/json; charset=utf-8'
$req.Headers['Authorization'] = "Basic $base64"
$req.ContentLength = $payloadBytes.Length

$reqStream = $req.GetRequestStream()
$reqStream.Write($payloadBytes, 0, $payloadBytes.Length)
$reqStream.Close()

try {
    $resp = $req.GetResponse()
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream(), [System.Text.Encoding]::UTF8)
    $respBody = $reader.ReadToEnd()
    $resp.Close()
    $parsed = $respBody | ConvertFrom-Json
    Write-Output "OK - Page ID $($parsed.id), Link: $($parsed.link)"
} catch {
    Write-Output "FAILED"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Output "Error: $($reader.ReadToEnd())"
    }
}

Remove-Item $payloadFile -Force -ErrorAction SilentlyContinue
