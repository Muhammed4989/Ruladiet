$html = Get-Content -Path 'C:\Users\moham\ruladiet-site\index.html' -Raw -Encoding UTF8
$mainStart = $html.IndexOf('<main>') + 6
$mainEnd = $html.IndexOf('</main>')
$mainContent = $html.Substring($mainStart, $mainEnd - $mainStart)

$replaces = @{
    'images/ruladiet1.webp' = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-content/uploads/2026/05/ruladiet1.webp'
    'images/ruladiet1.png' = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-content/uploads/2026/05/ruladiet1.webp'
    'images/course1.webp' = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-content/uploads/2026/05/course1.webp'
    'images/course2.webp' = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-content/uploads/2026/05/course2.webp'
    'images/course3.webp' = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-content/uploads/2026/05/course3.webp'
    'images/course4.webp' = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-content/uploads/2026/05/course4.webp'
    'href="appointment.html"' = 'href="/appointment"'
    'href="courses.html"' = 'href="/courses"'
    'href="team.html"' = 'href="/team"'
    'href="blog.html"' = 'href="/blog"'
    'href="privacy.html"' = 'href="/privacy"'
    'href="terms.html"' = 'href="/terms"'
    'href="refund.html"' = 'href="/refund"'
}
foreach ($key in $replaces.Keys) { $mainContent = $mainContent.Replace($key, $replaces[$key]) }
$bodyContent = "<div class=""rula-page"">`n$mainContent`n</div>"

$jsonBody = @{content=$bodyContent; status='publish'}
$jsonStr = $jsonBody | ConvertTo-Json -Depth 3 -Compress

$Utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("C:\Users\moham\ruladiet-site\payload.json", $jsonStr, $Utf8NoBom)
Write-Host "Done: $( (Get-Item 'C:\Users\moham\ruladiet-site\payload.json').Length ) bytes"
