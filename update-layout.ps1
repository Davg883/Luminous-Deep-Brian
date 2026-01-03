# Read the file
$content = Get-Content "app\sanctuary\page.tsx" -Raw

# Replace the grid column definition
$content = $content -replace 'grid grid-cols-1 lg:grid-cols-12 gap-12', 'grid grid-cols-1 lg:grid-cols-12 gap-4'

# Replace the left column span
$content = $content -replace 'lg:col-span-7 flex flex-col justify-center', 'lg:col-span-3 flex flex-col gap-3'

# Replace the right column span  
$content = $content -replace 'lg:col-span-5 flex flex-col justify-end', 'lg:col-span-3 flex flex-col justify-end'

# Replace the title size
$content = $content -replace 'text-5xl md:text-6xl', 'text-3xl'

# Replace mb-8 with mb-2
$content = $content -replace 'className="mb-8"', 'className="mb-2"'

# Replace text-xs with text-[10px]
$content = $content -replace 'font-mono text-xs text-slate-500', 'font-mono text-[10px] text-slate-500'

# Write back
Set-Content -Path "app\sanctuary\page.tsx" -Value $content
Write-Host "✅ Layout updated to 3-column design"
