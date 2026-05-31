$ErrorActionPreference = 'Stop'
$stagingUrl = 'https://wordpress-733947-6451423.cloudwaysapps.com'
$user = 'dietitianrula@gmail.com'
$appPass = 'TJ8X WR4g dV3O sQnX sAam mOFq'
$pair = "$user`:$appPass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Create-Page {
    param($file, $slug, $title, $desc, $linkReplace)
    
    $html = Get-Content -Path $file -Raw -Encoding UTF8
    $mainStart = $html.IndexOf('<main>') + 6
    $mainEnd = $html.IndexOf('</main>')
    $mainContent = $html.Substring($mainStart, $mainEnd - $mainStart).Trim()
    
    # Replace links
    foreach ($k in $linkReplace.Keys) { $mainContent = $mainContent.Replace($k, $linkReplace[$k]) }
    
    $jsonBody = @{
        title = $title
        content = $mainContent
        excerpt = $desc
        slug = $slug
        status = 'publish'
    } | ConvertTo-Json -Depth 3 -Compress
    
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $payloadFile = "C:\Users\moham\ruladiet-site\payload_$slug.json"
    [System.IO.File]::WriteAllText($payloadFile, $jsonBody, $Utf8NoBom)
    
    $payloadBytes = [System.IO.File]::ReadAllBytes($payloadFile)
    $uri = "$stagingUrl/wp-json/wp/v2/pages"
    
    $req = [System.Net.WebRequest]::CreateHttp($uri)
    $req.Method = 'POST'
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
        Write-Output "OK - Page ID $($parsed.id), Slug: $($parsed.slug), Link: $($parsed.link)"
    } catch {
        Write-Output "FAILED: $slug"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            Write-Output "  Error: $($reader.ReadToEnd())"
        }
    }
    
    Remove-Item $payloadFile -Force -ErrorAction SilentlyContinue
}

# Create Team page
Write-Output "=== Creating Team page ==="
Create-Page -file "C:\Users\moham\ruladiet-site\team.html" -slug "team" -title "عن الفريق - رولا دايت" -desc "تعرف على فريق رولا دايت - فريق من الخبراء والمختصين في التغذية والصحة يعملون معك لتحقيق أهدافك الصحية." -linkReplace @{ 'href="appointment.html"'='href="/appointment"'; 'href="courses.html"'='href="/courses"'; 'href="../index.html"'='href="/"'; 'href="../blog.html"'='href="/blog"'; 'href="../courses.html"'='href="/courses"'; 'href="../team.html"'='href="/team"'; 'href="../appointment.html"'='href="/appointment"'; 'href="../rula-alloush.html"'='href="/team"' }

# Create Appointment page
Write-Output "=== Creating Appointment page ==="
Create-Page -file "C:\Users\moham\ruladiet-site\appointment.html" -slug "appointment" -title "احجز موعد - رولا دايت" -desc "احجز موعد استشارة تغذية مع اختصاصية التغذية رولا علوش في عيادة رولا دايت - اسطنبول. استشارات حضورية وأونلاين لحياة صحية متوازنة." -linkReplace @{ 'href="appointment.html"'='href="/appointment"'; 'href="courses.html"'='href="/courses"'; 'href="team.html"'='href="/team"'; 'href="blog.html"'='href="/blog"' }

Write-Output "`nAll pages created."
