[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$user = 'dietitianrula@gmail.com'
$appPass = 'TJ8X WR4g dV3O sQnX sAam mOFq'
$pair = "$user`:$appPass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{Authorization="Basic $base64"; 'Content-Type'='application/json; charset=utf-8'}

# Read the Vercel index.html
$html = Get-Content -Path 'C:\Users\moham\ruladiet-site\index.html' -Raw -Encoding UTF8

# Extract main content (between <main> and </main>)
$mainStart = $html.IndexOf('<main>') + 6
$mainEnd = $html.IndexOf('</main>')
$mainContent = $html.Substring($mainStart, $mainEnd - $mainStart)

# Replace image paths
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

foreach ($key in $replaces.Keys) {
    $mainContent = $mainContent.Replace($key, $replaces[$key])
}

# Wrap in container div
$bodyContent = "<div class=`"rula-page`">`n$mainContent`n</div>"

# Manually construct JSON to avoid encoding issues
# JSON-escape the content
$escaped = $bodyContent.Replace('\', '\\').Replace('"', '\"').Replace("`n", '\n').Replace("`r", '\r').Replace("`t", '\t')
$jsonPayload = "{`"content`":`"$escaped`",`"status`":`"publish`"}"

Write-Output "Content length: $($bodyContent.Length) characters"
Write-Output "JSON payload length: $($jsonPayload.Length) characters"

# Convert to UTF-8 bytes explicitly
$utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonPayload)

# Send PUT request using WebRequest for byte-level control
$uri = 'https://wordpress-733947-6451423.cloudwaysapps.com/wp-json/wp/v2/pages/15'
$webRequest = [System.Net.WebRequest]::CreateHttp($uri)
$webRequest.Method = 'PUT'
$webRequest.ContentType = 'application/json; charset=utf-8'
$webRequest.Headers['Authorization'] = "Basic $base64"
$webRequest.ContentLength = $utf8Bytes.Length

$requestStream = $webRequest.GetRequestStream()
$requestStream.Write($utf8Bytes, 0, $utf8Bytes.Length)
$requestStream.Close()

try {
    $response = $webRequest.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream(), [System.Text.Encoding]::UTF8)
    $responseBody = $reader.ReadToEnd()
    $response.Close()
    Write-Output "SUCCESS! HTTP $($response.StatusCode)"
    Write-Output "Response: $($responseBody.Substring(0, [Math]::Min(200, $responseBody.Length)))"
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Output "Status: $($_.Exception.Response.StatusCode.value__)"
        Write-Output "Response: $($responseBody.Substring(0, [Math]::Min(500, $responseBody.Length)))"
    }
}
