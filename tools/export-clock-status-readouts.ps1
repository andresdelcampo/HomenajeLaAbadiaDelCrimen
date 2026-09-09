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
    [int]$CopyBackgroundTileWidth = 0
  )

  $sourceImage = [System.Drawing.Bitmap]::FromFile($Source)
  try {
    $readout = New-Object System.Drawing.Bitmap $Crop.Width, $Crop.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($readout)
      try {
        $graphics.DrawImage($sourceImage, [System.Drawing.Rectangle]::new(0, 0, $Crop.Width, $Crop.Height), $Crop, [System.Drawing.GraphicsUnit]::Pixel)
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

      $destination = Join-Path $outputDirectory "$Name.png"
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
