param(
  [Parameter(Mandatory=$true)][string]$TemplatePath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
function Describe-Shapes($shapes) {
  $result = @()
  for ($i = 1; $i -le $shapes.Count; $i++) {
    $shape = $shapes.Item($i)
    $entry = [ordered]@{ id = $shape.Id; name = $shape.Name; type = [int]$shape.Type; x = $shape.Left; y = $shape.Top; width = $shape.Width; height = $shape.Height }
    if ($shape.Type -eq 14) { $entry.placeholderType = [int]$shape.PlaceholderFormat.Type }
    if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
      $entry.text = $shape.TextFrame.TextRange.Text
      $entry.font = $shape.TextFrame.TextRange.Font.Name
      $entry.fontSize = $shape.TextFrame.TextRange.Font.Size
    }
    if ($shape.Type -eq 6) { $entry.children = @(Describe-Shapes $shape.GroupItems) }
    $result += [pscustomobject]$entry
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shape)
  }
  return $result
}
$application = $null
$presentation = $null
$copy = Join-Path $OutputPath ('.inspect-' + [guid]::NewGuid().ToString() + '.pptx')
try {
  [IO.File]::Copy($TemplatePath, $copy)
  $application = New-Object -ComObject PowerPoint.Application
  $presentation = $application.Presentations.Open($copy, -1, 0, 0)
  $result = [ordered]@{ width = $presentation.PageSetup.SlideWidth; height = $presentation.PageSetup.SlideHeight; slides = @(); masters = @() }
  $preview = Join-Path $OutputPath 'reference-preview'
  [void][IO.Directory]::CreateDirectory($preview)
  for ($i = 1; $i -le $presentation.Slides.Count; $i++) {
    $slide = $presentation.Slides.Item($i)
    $result.slides += [pscustomobject]@{ index = $i; id = $slide.SlideID; name = $slide.Name; layout = $slide.CustomLayout.Name; master = $slide.Design.Name; shapes = @(Describe-Shapes $slide.Shapes) }
    $slide.Export((Join-Path $preview ('slide-{0:D2}.png' -f $i)), 'PNG', 1600, [int](1600 * $result.height / $result.width))
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($slide)
  }
  for ($i = 1; $i -le $presentation.Designs.Count; $i++) {
    $design = $presentation.Designs.Item($i)
    $layouts = @()
    for ($j = 1; $j -le $design.SlideMaster.CustomLayouts.Count; $j++) {
      $layout = $design.SlideMaster.CustomLayouts.Item($j)
      $layouts += [pscustomobject]@{ index = $j; name = $layout.Name; shapes = @(Describe-Shapes $layout.Shapes) }
      [void][Runtime.InteropServices.Marshal]::ReleaseComObject($layout)
    }
    $result.masters += [pscustomobject]@{ index = $i; name = $design.Name; layouts = $layouts }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($design)
  }
  $json = $result | ConvertTo-Json -Depth 30
  [IO.File]::WriteAllText((Join-Path $OutputPath 'template-inventory.json'), $json, (New-Object Text.UTF8Encoding($false)))
  Write-Output ('Inspected {0} slides and {1} masters.' -f $result.slides.Count, $result.masters.Count)
} finally {
  if ($null -ne $presentation) { $presentation.Close(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) }
  if ($null -ne $application) {
    if ($application.Presentations.Count -eq 0) { $application.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($application)
  }
  if ([IO.File]::Exists($copy)) { [IO.File]::Delete($copy) }
}
