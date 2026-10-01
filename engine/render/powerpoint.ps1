param(
  [Parameter(Mandatory=$true)][string]$PptxPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
$application = $null
$presentation = $null
try {
  $application = New-Object -ComObject PowerPoint.Application
  # Read-only, without a document window. Never operate on the user's active deck.
  $presentation = $application.Presentations.Open($PptxPath, -1, 0, 0)
  $height = [int][Math]::Round(1600 * $presentation.PageSetup.SlideHeight / $presentation.PageSetup.SlideWidth)
  for ($i = 1; $i -le $presentation.Slides.Count; $i++) {
    $slide = $presentation.Slides.Item($i)
    try {
      $target = Join-Path $OutputPath ('slide-{0:D2}.png' -f $i)
      $slide.Export($target, 'PNG', 1600, $height)
    } finally {
      [void][Runtime.InteropServices.Marshal]::ReleaseComObject($slide)
    }
  }
} finally {
  if ($null -ne $presentation) {
    $presentation.Close()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
  }
  if ($null -ne $application) {
    # PowerPoint can reuse an existing instance. Leave other open decks intact.
    if ($application.Presentations.Count -eq 0) { $application.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($application)
  }
}
