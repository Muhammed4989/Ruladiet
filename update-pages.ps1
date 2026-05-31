$ErrorActionPreference = 'Stop'
$stagingUrl = 'https://wordpress-733947-6451423.cloudwaysapps.com'
$user = 'dietitianrula@gmail.com'
$appPass = 'TJ8X WR4g dV3O sQnX sAam mOFq'
$pair = "$user`:$appPass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Update-Page {
    param($id, $file, $title, $desc, $linkReplace)
    
    $html = Get-Content -Path $file -Raw -Encoding UTF8
    $mainStart = $html.IndexOf('<main>') + 6
    $mainEnd = $html.IndexOf('</main>')
    $mainContent = $html.Substring($mainStart, $mainEnd - $mainStart).Trim()
    
    foreach ($k in $linkReplace.Keys) { $mainContent = $mainContent.Replace($k, $linkReplace[$k]) }
    
    $jsonBody = @{
        title = $title
        content = $mainContent
        excerpt = $desc
    } | ConvertTo-Json -Depth 3 -Compress
    
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $payloadFile = "C:\Users\moham\ruladiet-site\payload_update_$id.json"
    [System.IO.File]::WriteAllText($payloadFile, $jsonBody, $Utf8NoBom)
    
    $payloadBytes = [System.IO.File]::ReadAllBytes($payloadFile)
    $uri = "$stagingUrl/wp-json/wp/v2/pages/$id"
    
    $req = [System.Net.WebRequest]::CreateHttp($uri)
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
        Write-Output "FAILED: ID $id"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            Write-Output "  Error: $($reader.ReadToEnd())"
        }
    }
    
    Remove-Item $payloadFile -Force -ErrorAction SilentlyContinue
}

$linkReplaces = @{
    'href="appointment.html"' = 'href="/appointment"'
    'href="courses.html"' = 'href="/courses"'
    'href="team.html"' = 'href="/team"'
    'href="blog.html"' = 'href="/blog"'
    'href="privacy.html"' = 'href="/privacy"'
    'href="terms.html"' = 'href="/terms"'
    'href="refund.html"' = 'href="/refund"'
    'href="../index.html"' = 'href="/"'
    'href="../blog.html"' = 'href="/blog"'
    'href="../courses.html"' = 'href="/courses"'
    'href="../team.html"' = 'href="/team"'
    'href="../appointment.html"' = 'href="/appointment"'
    'href="../rula-alloush.html"' = 'href="/team"'
}

# Update Team page (ID 21)
Write-Output "=== Updating Team page (ID 21) ==="
Update-Page -id 21 -file "C:\Users\moham\ruladiet-site\team.html" -title "عن الفريق - رولا دايت" -desc "تعرف على فريق رولا دايت - فريق من الخبراء والمختصين في التغذية والصحة يعملون معك لتحقيق أهدافك الصحية." -linkReplace $linkReplaces

# Update Appointment page (ID 19)
Write-Output "=== Updating Appointment page (ID 19) ==="
Update-Page -id 19 -file "C:\Users\moham\ruladiet-site\appointment.html" -title "احجز موعد - رولا دايت" -desc "احجز موعد استشارة تغذية مع اختصاصية التغذية رولا علوش في عيادة رولا دايت - اسطنبول. استشارات حضورية وأونلاين لحياة صحية متوازنة." -linkReplace @{ 'href="appointment.html"'='href="/appointment"'; 'href="courses.html"'='href="/courses"'; 'href="team.html"'='href="/team"'; 'href="blog.html"'='href="/blog"' }

Write-Output "Done."
