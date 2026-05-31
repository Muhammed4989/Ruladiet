$ErrorActionPreference = 'Stop'
$stagingUrl = 'https://wordpress-733947-6451423.cloudwaysapps.com'
$user = 'dietitianrula@gmail.com'
$appPass = 'TJ8X WR4g dV3O sQnX sAam mOFq'
$pair = "$user`:$appPass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

$imgMap = @{
    '../images/rulamain.webp' = "$stagingUrl/wp-content/uploads/2026/05/rulamain-scaled.webp"
    '../images/course1.webp' = "$stagingUrl/wp-content/uploads/2026/05/course1.webp"
    '../images/course2.webp' = "$stagingUrl/wp-content/uploads/2026/05/course2.webp"
    '../images/course3.webp' = "$stagingUrl/wp-content/uploads/2026/05/course3.webp"
    '../images/course4.webp' = "$stagingUrl/wp-content/uploads/2026/05/course4.webp"
}
$linkMap = @{
    '../index.html' = '/'
    '../blog.html' = '/blog'
    '../courses.html' = '/courses'
    '../team.html' = '/team'
    '../appointment.html' = '/appointment'
    '../rula-alloush.html' = '/team'
    '../privacy.html' = '/privacy'
    '../terms.html' = '/terms'
    '../refund.html' = '/refund'
    'ramadan-without-sugar.html' = '/ramadan-without-sugar'
    'new-year-mission.html' = '/new-year-mission'
    'impossible-mission-moms.html' = '/impossible-mission-moms'
}

$posts = @(
    @{file='ramadan-without-sugar.html'; slug='ramadan-without-sugar'}
    @{file='new-year-mission.html'; slug='new-year-mission'}
    @{file='impossible-mission-moms.html'; slug='impossible-mission-moms'}
    @{file='ابر-التنحيف-الحديثة.html'; slug='ابر-التنحيف-الحديثة'}
)

function Replace-Content {
    param($text)
    foreach ($k in $imgMap.Keys) { $text = $text.Replace($k, $imgMap[$k]) }
    foreach ($k in $linkMap.Keys) { $text = $text.Replace("href=`"$k`"", "href=`"$($linkMap[$k])`"") }
    return $text
}

$blogDir = 'C:\Users\moham\ruladiet-site\blog'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

foreach ($post in $posts) {
    Write-Host "Processing: $($post.file)... " -NoNewline
    
    $html = Get-Content -Path "$blogDir\$($post.file)" -Raw -Encoding UTF8
    
    $titleMatch = [regex]::Match($html, '<title>(.*?)</title>')
    $title = $titleMatch.Groups[1].Value.Trim() -replace '\s*\|\s*رولا دايت.*$', ''
    
    $descMatch = [regex]::Match($html, '<meta name="description" content="(.*?)"')
    $excerpt = if ($descMatch.Success) { $descMatch.Groups[1].Value.Trim() } else { '' }
    
    $mainStart = $html.IndexOf('<main>') + 6
    $mainEnd = $html.IndexOf('</main>')
    $mainContent = $html.Substring($mainStart, $mainEnd - $mainStart).Trim()
    $mainContent = Replace-Content $mainContent
    
    $jsonBody = @{
        title = $title
        content = $mainContent
        excerpt = $excerpt
        slug = $post.slug
        status = 'publish'
    } | ConvertTo-Json -Depth 3 -Compress
    
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $payloadFile = "C:\Users\moham\ruladiet-site\payload_$($post.slug).json"
    [System.IO.File]::WriteAllText($payloadFile, $jsonBody, $Utf8NoBom)
    
    # Read payload as bytes and send via system.net.webrequest
    $payloadBytes = [System.IO.File]::ReadAllBytes($payloadFile)
    $uri = "$stagingUrl/wp-json/wp/v2/posts"
    
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
        Write-Host "OK - ID $($parsed.id), slug: $($parsed.slug)"
    } catch {
        Write-Host "FAILED"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            Write-Host "  Error: $($reader.ReadToEnd())"
        }
    }
    
    Remove-Item $payloadFile -Force -ErrorAction SilentlyContinue
}

Write-Host "`nAll blog posts done."
