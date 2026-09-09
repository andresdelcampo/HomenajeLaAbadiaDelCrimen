$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$output = Join-Path $workspace 'Homenaje\assets\programming\graphics'

$sets = @(
  @{ Platform='pc'; Variant='day'; Root='analysis\abbey-map-graphics\assets'; Tile='tile-atlas-cga-day.png'; Atlas='block-atlas-cga-day.png'; Blocks='blocks-cga-day' },
  @{ Platform='pc'; Variant='night'; Root='analysis\abbey-map-graphics\assets'; Tile='tile-atlas-cga-night.png'; Atlas='block-atlas-cga-night.png'; Blocks='blocks-cga-night' },
  @{ Platform='cpc'; Variant='day'; Root='analysis\abbey-map-graphics\assets'; Tile='tile-atlas-cpc-day.png'; Atlas='block-atlas-cpc-day.png'; Blocks='blocks-cpc-day' },
  @{ Platform='cpc'; Variant='night'; Root='analysis\abbey-map-graphics\assets'; Tile='tile-atlas-cpc-night.png'; Atlas='block-atlas-cpc-night.png'; Blocks='blocks-cpc-night' },
  @{ Platform='vga'; Variant='day'; Root='analysis\abbey-map-graphics\assets'; Tile='tile-atlas-vga-day.png'; Atlas='block-atlas-vga-day.png'; Blocks='blocks-vga-day' },
  @{ Platform='vga'; Variant='night'; Root='analysis\abbey-map-graphics\assets'; Tile='tile-atlas-vga-night.png'; Atlas='block-atlas-vga-night.png'; Blocks='blocks-vga-night' },
  @{ Platform='spectrum'; Variant='day'; Root='analysis\spectrum-map-graphics\assets'; Tile='tile-atlas-day.png'; Atlas='block-atlas-day.png'; Blocks='blocks-day' },
  @{ Platform='spectrum'; Variant='night'; Root='analysis\spectrum-map-graphics\assets'; Tile='tile-atlas-night.png'; Atlas='block-atlas-night.png'; Blocks='blocks-night' },
  @{ Platform='msx'; Variant='day'; Root='analysis\msx-map-graphics\assets'; Tile='tile-atlas-day.png'; Atlas='block-atlas-day.png'; Blocks='blocks-day' },
  @{ Platform='msx'; Variant='night'; Root='analysis\msx-map-graphics\assets'; Tile='tile-atlas-night.png'; Atlas='block-atlas-night.png'; Blocks='blocks-night' }
)

foreach ($set in $sets) {
  $source = Join-Path $workspace $set.Root
  $destination = Join-Path $output (Join-Path $set.Platform $set.Variant)
  $blockDestination = Join-Path $destination 'blocks'
  New-Item -ItemType Directory -Force -Path $blockDestination | Out-Null
  Copy-Item -LiteralPath (Join-Path $source $set.Tile) -Destination (Join-Path $destination 'tile-atlas.png')
  Copy-Item -LiteralPath (Join-Path $source $set.Atlas) -Destination (Join-Path $destination 'block-atlas.png')
  Copy-Item -Path (Join-Path (Join-Path $source $set.Blocks) '*.png') -Destination $blockDestination
}

Write-Host "Exported $($sets.Count) graphics-system sets to $output"
