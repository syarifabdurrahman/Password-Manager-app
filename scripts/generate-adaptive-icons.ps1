Add-Type -AssemblyName System.Drawing

$srcPath = "assets/images/Icon 512x512.png"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

# Android adaptive icon sizes (in pixels) - full foreground size
$sizes = @{
    "mdpi" = 108
    "hdpi" = 162
    "xhdpi" = 216
    "xxhdpi" = 324
    "xxxhdpi" = 432
}

$baseDir = "android/app/src/main/res"

foreach ($dpi in $sizes.Keys) {
    $fullSize = $sizes[$dpi]
    # Safe zone is 66% of full size (Android adaptive icon safe area)
    $safeSize = [math]::Floor($fullSize * 0.66)
    $offset = [math]::Floor(($fullSize - $safeSize) / 2)

    $destPath = "$baseDir/mipmap-$dpi/ic_launcher_foreground.png"

    # Create new bitmap with target size
    $dest = New-Object System.Drawing.Bitmap($fullSize, $fullSize)

    # Draw source image scaled to safe zone (centered)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Draw image centered in safe zone
    $graphics.DrawImage($src, $offset, $offset, $safeSize, $safeSize)

    # Save
    $dest.Save($destPath)

    $graphics.Dispose()
    $dest.Dispose()

    Write-Host "Generated: $destPath ($fullSize x $fullSize, safe zone: $safeSize x $safeSize)"
}

# Generate background layer (solid color #6366F1)
foreach ($dpi in $sizes.Keys) {
    $size = $sizes[$dpi]
    $destPath = "$baseDir/mipmap-$dpi/ic_launcher_background.png"

    # Create solid color bitmap
    $dest = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $color = [System.Drawing.Color]::FromArgb(99, 102, 241) # #6366F1
    $graphics.Clear($color)
    $dest.Save($destPath)

    $graphics.Dispose()
    $dest.Dispose()

    Write-Host "Generated: $destPath"
}

$src.Dispose()
Write-Host "Android adaptive icons generated successfully!"
