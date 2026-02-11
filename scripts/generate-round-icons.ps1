Add-Type -AssemblyName System.Drawing

$srcPath = "assets/images/Icon 512x512.png"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

# Android round launcher sizes (in pixels)
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

    $destPath = "$baseDir/mipmap-$dpi/ic_launcher_round.png"

    # Create new bitmap with target size
    $dest = New-Object System.Drawing.Bitmap($size, $size)

    # Create a circular clip with background
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::Transparent)

    # Create circular path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $size, $size)

    # Fill circle with background color
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(99, 102, 241))
    $graphics.FillPath($brush, $path)

    # Set clip for image
    $graphics.SetClip($path)

    # Draw source image scaled and centered (with padding)
    $graphics.DrawImage($src, $offset, $offset, $safeSize, $safeSize)

    # Save
    $dest.Save($destPath)

    $graphics.Dispose()
    $dest.Dispose()
    $brush.Dispose()
    $path.Dispose()

    Write-Host "Generated: $destPath"
}

$src.Dispose()
Write-Host "Android round launcher icons generated successfully!"
