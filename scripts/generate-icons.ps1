Add-Type -AssemblyName System.Drawing

$srcPath = "assets/images/Icon 512x512.png"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

# Android sizes (in pixels)
$sizes = @{
    "mdpi" = 48
    "hdpi" = 72
    "xhdpi" = 96
    "xxhdpi" = 144
    "xxxhdpi" = 192
}

$baseDir = "android/app/src/main/res"

foreach ($dpi in $sizes.Keys) {
    $size = $sizes[$dpi]
    # Add 10% padding for better visual
    $safeSize = [math]::Floor($size * 0.85)
    $offset = [math]::Floor(($size - $safeSize) / 2)

    $destPath = "$baseDir/mipmap-$dpi/ic_launcher.png"

    # Create new bitmap with target size
    $dest = New-Object System.Drawing.Bitmap($size, $size)

    # Draw source image scaled to destination (with padding)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.Clear([System.Drawing.Color]::FromArgb(99, 102, 241)) # Background color
    $graphics.DrawImage($src, $offset, $offset, $safeSize, $safeSize)

    # Save
    $dest.Save($destPath)

    $graphics.Dispose()
    $dest.Dispose()

    Write-Host "Generated: $destPath"
}

$src.Dispose()
Write-Host "Android icons generated successfully!"
