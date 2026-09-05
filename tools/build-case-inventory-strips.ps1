Add-Type -AssemblyName System.Drawing

$systems = @('cpc', 'pc', 'vga', 'spectrum', 'msx')
$itemNames = @('libro', 'pergamino', 'llave')

foreach ($system in $systems) {
  $itemDirectory = (Resolve-Path (Join-Path $PSScriptRoot "..\assets\platforms\$system\items")).Path
  $items = @{}

  foreach ($itemName in $itemNames) {
    $items[$itemName] = [System.Drawing.Bitmap]::FromFile((Join-Path $itemDirectory "$itemName.png"))
  }

  try {
    $width = $items.libro.Width
    $height = $items.libro.Height
    $difference = [System.Drawing.Rectangle]::Empty

    for ($y = 0; $y -lt $height; $y++) {
      for ($x = 0; $x -lt $width; $x++) {
        $bookPixel = $items.libro.GetPixel($x, $y).ToArgb()
        if ($bookPixel -ne $items.pergamino.GetPixel($x, $y).ToArgb() -or
            $bookPixel -ne $items.llave.GetPixel($x, $y).ToArgb()) {
          $pixelRectangle = [System.Drawing.Rectangle]::new($x, $y, 1, 1)
          $difference = if ($difference.IsEmpty) { $pixelRectangle } else { [System.Drawing.Rectangle]::Union($difference, $pixelRectangle) }
        }
      }
    }

    if ($difference.IsEmpty) {
      throw "No item-pixel differences found for $system."
    }

    $strip = [System.Drawing.Bitmap]::new($items.pergamino)
    # CPC, PC, and VGA place their three 64-pixel slots 80 pixels apart.
    # Spectrum and MSX use the wider 400-pixel status bar and 128-pixel spacing.
    $slotOffset = if ($width -eq 400) { 128 } else { 80 }
    $placements = @(
      @{ Source = $items.libro; DestinationX = $difference.X - $slotOffset },
      @{ Source = $items.llave; DestinationX = $difference.X + $slotOffset }
    )

    foreach ($placement in $placements) {
      for ($y = $difference.Top; $y -lt $difference.Bottom; $y++) {
        for ($x = 0; $x -lt $difference.Width; $x++) {
          $strip.SetPixel($placement.DestinationX + $x, $y, $placement.Source.GetPixel($difference.X + $x, $y))
        }
      }
    }

    $opaqueBounds = [System.Drawing.Rectangle]::Empty
    for ($y = 0; $y -lt $strip.Height; $y++) {
      for ($x = 0; $x -lt $strip.Width; $x++) {
        if ($strip.GetPixel($x, $y).A -gt 0) {
          $pixelRectangle = [System.Drawing.Rectangle]::new($x, $y, 1, 1)
          $opaqueBounds = if ($opaqueBounds.IsEmpty) { $pixelRectangle } else { [System.Drawing.Rectangle]::Union($opaqueBounds, $pixelRectangle) }
        }
      }
    }

    $trimmed = $strip.Clone($opaqueBounds, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $stream = [System.IO.MemoryStream]::new()
      try {
        $trimmed.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
        [System.IO.File]::WriteAllBytes((Join-Path $itemDirectory 'case-inventory.png'), $stream.ToArray())
      }
      finally {
        $stream.Dispose()
      }
    }
    finally {
      $trimmed.Dispose()
      $strip.Dispose()
    }
  }
  finally {
    foreach ($itemName in $itemNames) {
      $items[$itemName].Dispose()
    }
  }
}
