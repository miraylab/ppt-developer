param(
  [Parameter(Mandatory=$true)][string]$PptxPath,
  [Parameter(Mandatory=$true)][int]$SlideNumber
)
$ErrorActionPreference = 'Stop'
$application = $null
$presentation = $null
try {
  $application = New-Object -ComObject PowerPoint.Application
  $presentation = $application.Presentations.Open($PptxPath, -1, 0, 0)
  $slide = $presentation.Slides.Item($SlideNumber)
  $items = @()
  for ($i = 1; $i -le $slide.Shapes.Count; $i++) {
    $shape = $slide.Shapes.Item($i)
    $text = $null
    if ($shape.HasTextFrame -eq -1 -and $shape.TextFrame.HasText -eq -1) {
      $text = $shape.TextFrame.TextRange.Text
    }
    $items += [pscustomobject]@{
      index = $i; id = $shape.Id; name = $shape.Name; type = [int]$shape.Type
      x = [math]::Round($shape.Left / 72, 3); y = [math]::Round($shape.Top / 72, 3)
      w = [math]::Round($shape.Width / 72, 3); h = [math]::Round($shape.Height / 72, 3)
      text = $text
    }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shape)
  }
  $items | ConvertTo-Json -Depth 5
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($slide)
} finally {
  if ($null -ne $presentation) {
    $presentation.Close()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
  }
  if ($null -ne $application) {
    if ($application.Presentations.Count -eq 0) { $application.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($application)
  }
}
