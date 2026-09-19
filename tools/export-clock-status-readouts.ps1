Add-Type -AssemblyName System.Drawing

$siteRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $siteRoot 'assets\game\clock-status'
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

function Export-ClockStatusReadout {
  param(
    [string]$Name,
    [string]$Source,
    [System.Drawing.Rectangle]$Crop,
    [System.Drawing.Rectangle]$LabelArea,
    [System.Drawing.Color]$LetterColor,
    [System.Drawing.Color]$BackgroundColor,
    [switch]$FillArea,
    [int]$CopyBackgroundRow = -1,
    [int]$CopyBackgroundTileX = -1,
    [int]$CopyBackgroundTileWidth = 0,
    [string]$DestinationDirectory = $null,
    [int]$VerticalScale = 1
  )

  $sourceImage = [System.Drawing.Bitmap]::FromFile($Source)
  try {
    $readout = New-Object System.Drawing.Bitmap $Crop.Width, ($Crop.Height * $VerticalScale), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($readout)
      try {
        if ($VerticalScale -gt 1) {
          $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
          $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
        }
        $graphics.DrawImage($sourceImage, [System.Drawing.Rectangle]::new(0, 0, $Crop.Width, ($Crop.Height * $VerticalScale)), $Crop, [System.Drawing.GraphicsUnit]::Pixel)
      }
      finally {
        $graphics.Dispose()
      }

      if ($LabelArea.Width -gt 0) {
        for ($y = $LabelArea.Top; $y -lt $LabelArea.Bottom; $y++) {
          for ($x = $LabelArea.Left; $x -lt $LabelArea.Right; $x++) {
            $pixel = $readout.GetPixel($x, $y)
            if ($CopyBackgroundTileX -ge 0 -and $CopyBackgroundTileWidth -gt 0) {
              $sampleX = $CopyBackgroundTileX + (($x - $LabelArea.Left) % $CopyBackgroundTileWidth)
              $readout.SetPixel($x, $y, $readout.GetPixel($sampleX, $y))
            }
            elseif ($CopyBackgroundRow -ge 0) {
              $readout.SetPixel($x, $y, $readout.GetPixel($x, $CopyBackgroundRow))
            }
            elseif ($FillArea -or $pixel.ToArgb() -eq $LetterColor.ToArgb()) {
              $readout.SetPixel($x, $y, $BackgroundColor)
            }
          }
        }
      }

      $destinationRoot = if ([string]::IsNullOrEmpty($DestinationDirectory)) { $outputDirectory } else { $DestinationDirectory }
      $destination = Join-Path $destinationRoot "$Name.png"
      $readout.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
      Write-Output $destination
    }
    finally {
      $readout.Dispose()
    }
  }
  finally {
    $sourceImage.Dispose()
  }
}

$ports = Join-Path $siteRoot 'assets\ports'
Export-ClockStatusReadout -Name 'cpc' -Source (Join-Path $ports 'cpc-3.png') -Crop ([System.Drawing.Rectangle]::new(0, 318, 128, 62)) -LabelArea ([System.Drawing.Rectangle]::new(8, 42, 112, 17)) -LetterColor ([System.Drawing.Color]::FromArgb(0, 0, 0)) -BackgroundColor ([System.Drawing.Color]::FromArgb(255, 255, 170))
Export-ClockStatusReadout -Name 'pc' -Source (Join-Path $ports 'pc-3.png') -Crop ([System.Drawing.Rectangle]::new(0, 318, 128, 62)) -LabelArea ([System.Drawing.Rectangle]::new(8, 42, 112, 17)) -LetterColor ([System.Drawing.Color]::FromArgb(0, 0, 0)) -BackgroundColor ([System.Drawing.Color]::FromArgb(255, 255, 85))
Export-ClockStatusReadout -Name 'spectrum' -Source (Join-Path $ports 'spectrum-3.png') -Crop ([System.Drawing.Rectangle]::new(0, 318, 128, 62)) -LabelArea ([System.Drawing.Rectangle]::new(0, 34, 111, 18)) -LetterColor ([System.Drawing.Color]::FromArgb(9, 216, 212)) -BackgroundColor ([System.Drawing.Color]::FromArgb(217, 1, 0)) -FillArea
Export-ClockStatusReadout -Name 'msx' -Source (Join-Path $ports 'msx-3.png') -Crop ([System.Drawing.Rectangle]::new(0, 318, 128, 62)) -LabelArea ([System.Drawing.Rectangle]::new(0, 34, 112, 18)) -LetterColor ([System.Drawing.Color]::FromArgb(64, 232, 240)) -BackgroundColor ([System.Drawing.Color]::FromArgb(208, 80, 72)) -FillArea
Export-ClockStatusReadout -Name 'vga' -Source (Join-Path $siteRoot 'assets\remake-vga\vga-remake-2.gif') -Crop ([System.Drawing.Rectangle]::new(0, 142, 56, 28)) -LabelArea ([System.Drawing.Rectangle]::new(12, 18, 27, 7)) -LetterColor ([System.Drawing.Color]::Empty) -BackgroundColor ([System.Drawing.Color]::Empty) -CopyBackgroundTileX 39 -CopyBackgroundTileWidth 13

# The PCW capture is a 720-pixel-wide screen with the game HUD centred at
# x=96. Keep the clock strip and Obsequium gauge as separate native crops;
# using the complete lower screenshot for both panels leaves the useful pixels
# tiny and makes the Obsequium panel repeat the clock artwork.
$pcw = Join-Path $ports 'pcw-3.png'
# The source capture contains the then-current `NONA` glyphs in the green
# phase plaque. Erase only those dark glyph pixels; the guide overlays its
# own explicit PRIMA/TERCIA/etc. SVG label at runtime.
Export-ClockStatusReadout -Name 'pcw' -Source $pcw -Crop ([System.Drawing.Rectangle]::new(96, 192, 128, 32)) -LabelArea ([System.Drawing.Rectangle]::new(0, 40, 128, 16)) -LetterColor ([System.Drawing.Color]::FromArgb(0, 0, 0)) -BackgroundColor ([System.Drawing.Color]::FromArgb(114, 227, 154)) -VerticalScale 2
Export-ClockStatusReadout -Name 'obsequium-pcw-current' -Source $pcw -Crop ([System.Drawing.Rectangle]::new(480, 192, 128, 32)) -LabelArea ([System.Drawing.Rectangle]::new(0, 0, 0, 0)) -LetterColor ([System.Drawing.Color]::Empty) -BackgroundColor ([System.Drawing.Color]::Empty) -DestinationDirectory (Split-Path $outputDirectory) -VerticalScale 2
