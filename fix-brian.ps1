$filePath = "app\sanctuary\page.tsx"
$content = Get-Content $filePath -Raw
$content = $content -replace 'id: "bunker-terminal-live-v3",', @'
id: "brian-speaks-v1",
        initialMessages: [
            {
                role: "system",
                content: "You are Brian. CRITICAL: When you use tools, ALWAYS say something like 'Acknowledged. Manifesting...' Never be silent."
            } as any
        ],
'@
Set-Content -Path $filePath -Value $content -NoNewline
Write-Host "✅ Updated successfully"
