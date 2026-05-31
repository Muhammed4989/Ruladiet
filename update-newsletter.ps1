$ErrorActionPreference = 'Stop'
$stagingUrl = 'https://wordpress-733947-6451423.cloudwaysapps.com'
$user = 'dietitianrula@gmail.com'
$appPass = 'TJ8X WR4g dV3O sQnX sAam mOFq'
$pair = "$user`:$appPass"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Read current homepage
$current = Get-Content 'C:\Users\moham\ruladiet-site\homepage_current.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$content = $current.content.rendered

Write-Output "Current content length: $($content.Length)"

# Find the newsletter form - search for the form start
$idx = $content.IndexOf('newsletter-form-new')
if ($idx -ge 0) {
    Write-Output "Found newsletter form at position $idx"
    
    # Find the start of the <form> tag
    $formTagStart = $content.LastIndexOf('<form', $idx)
    # Find the end of the </form> tag
    $formTagEnd = $content.IndexOf('</form>', $idx) + 7
    
    Write-Output "Form tag: $formTagStart to $formTagEnd"
    
    # Get the form HTML for verification
    $formHtml = $content.Substring($formTagStart, $formTagEnd - $formTagStart)
    Write-Output "Form HTML length: $($formHtml.Length)"
    
    # Replace form with MC4WP shortcode
    $newContent = $content.Substring(0, $formTagStart) + "<div class=""mc4wp-wrapper"">[mc4wp_form]</div>" + $content.Substring($formTagEnd)
    
    Write-Output "New content length: $($newContent.Length)"
    
    # Build JSON payload
    $jsonBody = @{content=$newContent} | ConvertTo-Json -Depth 3 -Compress
    
    $Utf8NoBom = New-Object System.Text.UTF8Encoding $false
    $payloadFile = 'C:\Users\moham\ruladiet-site\payload_hp_update.json'
    [System.IO.File]::WriteAllText($payloadFile, $jsonBody, $Utf8NoBom)
    Write-Output "Payload written: $((Get-Item $payloadFile).Length) bytes"
} else {
    Write-Output "Newsletter form not found!"
}
