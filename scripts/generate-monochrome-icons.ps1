Add-Type -AssemblyName System.Drawing

$srcPath = "assets/images/Icon 512x512.png"
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))

# Android monochrome icon sizes (in pixels) - 66% of launcher size
$sizes = @{
    "mdpi" = 81
    "hdpi" = 162
    "xhdpi" = 108
    "xxhdpi" = 216
    "xxxhdpi" = 288
}

$baseDir = "android/app/src/main/res"

# Create a grayscale version for monochrome
foreach ($dpi in $sizes.Keys) {
    $size = $sizes[$dpi]
    $destPath = "$baseDir/mipmap-$dpi/ic_launcher_monochrome.png"

    # Create new bitmap with target size
    $dest = New-Object System.Drawing.Bitmap($size, $size)

    # Draw source image scaled to destination with grayscale
    $graphics = [System.Drawing.Graphics]::FromImage($dest)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Create grayscale matrix
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $cm = New-Object System.Drawing.Imaging.ColorMatrix
    $cm.Matrix00 = 0.3
    $cm.Matrix01 = 0.59
    $cm.Matrix02 = 0.11
    $cm.Matrix03 = 0
    $cm.Matrix04 = 0
    $cm.Matrix10 = 0.3
    $cm.Matrix11 = 0.59
    $cm.Matrix12 = 0.11
    $cm.Matrix13 = 0
    $cm.Matrix14 = 0
    $cm.Matrix20 = 0.3
    $cm.Matrix21 = 0.59
    $cm.Matrix22 = 0.11
    $cm.Matrix23 = 0
    $cm.Matrix24 = 0
    $cm.Matrix30 = 0.3
    $cm.Matrix31 = 0.59
    $cm.Matrix32 = 0.11
    $cm.Matrix33 = 1
    $cm.Matrix34 = 0
    $cm.Matrix40 = 0
    $cm.Matrix41 = 0
    $cm.Matrix42 = 0
    $cm.Matrix43 = 0
    $cm.Matrix44 = 1
    $attr.SetColorMatrix($cm)

    $graphics.DrawImage($src, [System.Drawing.Rectangle]::FromLTRB(0, 0, $size, $size),
                        0, 0, $src.Width, $src.Height,
                        [System.Drawing.GraphicsUnit]::Pixel, $attr)

    # Save
    $dest.Save($destPath)

    $graphics.Dispose()
    $dest.Dispose()
    $attr.Dispose()

    Write-Host "Generated: $destPath"
}

$src.Dispose()
Write-Host "Android monochrome icons generated successfully!"
