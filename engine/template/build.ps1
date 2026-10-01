param(
  [Parameter(Mandatory=$true)][string]$WorkingPath,
  [Parameter(Mandatory=$true)][string]$PlanPath,
  [Parameter(Mandatory=$true)][string]$OutputPath
)
$ErrorActionPreference = 'Stop'
$plan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Find-TextShape($shapes, $target) {
  $found = @()
  for ($i = 1; $i -le $shapes.Count; $i++) {
    $shape = $shapes.Item($i)
    $match = ($null -ne $target.shapeId -and $shape.Id -eq $target.shapeId) -or
      ($null -ne $target.name -and $shape.Name -ceq $target.name) -or
      ($null -ne $target.placeholderType -and $shape.Type -eq 14 -and $shape.PlaceholderFormat.Type -eq $target.placeholderType)
    if ($match) { $found += $shape }
    elseif ($shape.Type -eq 6) { $found += @(Find-TextShape $shape.GroupItems $target) }
  }
  return $found
}

function Find-Layout($presentation, $selector) {
  $found = @()
  for ($i = 1; $i -le $presentation.Designs.Count; $i++) {
    $design = $presentation.Designs.Item($i)
    if ($design.Name -cne $selector.master) { continue }
    for ($j = 1; $j -le $design.SlideMaster.CustomLayouts.Count; $j++) {
      $layout = $design.SlideMaster.CustomLayouts.Item($j)
      if ($layout.Name -ceq $selector.name) { $found += $layout }
    }
  }
  if ($found.Count -ne 1) { throw ('Layout inexistente ou ambiguo: {0} / {1}' -f $selector.master, $selector.name) }
  return $found[0]
}

function Color-Value([string]$hex) {
  return [Convert]::ToInt32($hex.Substring(0, 2), 16) + 256 * [Convert]::ToInt32($hex.Substring(2, 2), 16) + 65536 * [Convert]::ToInt32($hex.Substring(4, 2), 16)
}

$application = $null
$presentation = $null
try {
  $application = New-Object -ComObject PowerPoint.Application
  $presentation = $application.Presentations.Open($WorkingPath, 0, 0, 0)
  # All edits occur in a disposable filesystem copy, including deletions below.
  $originalIds = @()
  for ($i = 1; $i -le $presentation.Slides.Count; $i++) { $originalIds += $presentation.Slides.Item($i).SlideID }
  for ($i = 1; $i -le $presentation.Designs.Count; $i++) {
    $design = $presentation.Designs.Item($i)
    $design.Preserved = -1
    for ($j = 1; $j -le $design.SlideMaster.CustomLayouts.Count; $j++) { $design.SlideMaster.CustomLayouts.Item($j).Preserved = -1 }
  }
  foreach ($spec in $plan.slides) {
    if ($null -ne $spec.source.slideId) {
      if ($originalIds -notcontains $spec.source.slideId) { throw ('SlideID ausente no template: {0}' -f $spec.source.slideId) }
      $source = $presentation.Slides.FindBySlideID([int]$spec.source.slideId)
      $range = $source.Duplicate()
      $slide = $range.Item(1)
      $slide.MoveTo($presentation.Slides.Count)
    } else {
      $layout = Find-Layout $presentation $spec.source.layout
      if ($null -ne $spec.source.footerFrom) {
        $footerKey = $spec.source.layout.master + '/' + $spec.source.layout.name
        if ($null -eq $footerLayouts) { $footerLayouts = @{} }
        if (-not $footerLayouts.ContainsKey($footerKey)) {
          $donor = Find-Layout $presentation $spec.source.footerFrom
          if ($donor.Name -eq $layout.Name -and $spec.source.footerFrom.master -eq $spec.source.layout.master) { throw 'O layout do rodape deve ser diferente do destino.' }
          $cutoff = [single]($spec.source.footerFrom.top * 72)
          for ($i = $layout.Shapes.Count; $i -ge 1; $i--) {
            if ($layout.Shapes.Item($i).Top -ge $cutoff) { $layout.Shapes.Item($i).Delete() }
          }
          for ($i = 1; $i -le $donor.Shapes.Count; $i++) {
            $item = $donor.Shapes.Item($i)
            if ($item.Top -ge $cutoff) {
              $item.Copy()
              $pasted = $layout.Shapes.Paste().Item(1)
              $pasted.Left = $item.Left; $pasted.Top = $item.Top
              $pasted.Width = $item.Width; $pasted.Height = $item.Height
            }
          }
          $footerLayouts[$footerKey] = $true
        }
      }
      $slide = $presentation.Slides.AddSlide($presentation.Slides.Count + 1, $layout)
    }
    foreach ($replacement in $spec.replacements) {
      $matches = @(Find-TextShape $slide.Shapes $replacement.target)
      if ($matches.Count -ne 1) { throw ('Texto inexistente ou ambiguo no slide {0}: {1}' -f $slide.SlideIndex, ($replacement.target | ConvertTo-Json -Compress)) }
      $shape = $matches[0]
      if ($shape.HasTextFrame -ne -1) { throw ('Shape {0} nao suporta texto.' -f $shape.Id) }
      $shape.TextFrame.TextRange.Text = $replacement.text.Replace("`r`n", "`n").Replace("`n", "`r")
    }
    foreach ($addition in $spec.additions) {
      if ($addition.kind -eq 'icon') {
        $iconPath = Join-Path (Split-Path -Parent $PlanPath) ('icon-' + [Guid]::NewGuid().ToString('N') + '.svg')
        [IO.File]::WriteAllText($iconPath, $addition.svg, (New-Object Text.UTF8Encoding($false)))
        try {
          $shape = $slide.Shapes.AddPicture($iconPath, 0, -1, [single]($addition.x * 72), [single]($addition.y * 72), [single]($addition.w * 72), [single]($addition.h * 72))
          $shape.Name = 'Lucide-' + $addition.name + '-' + $shape.Id
          $shape.AlternativeText = 'Lucide: ' + $addition.name
        } finally { Remove-Item -LiteralPath $iconPath -Force }
        continue
      }
      if ($addition.kind -eq 'line') {
        $shape = $slide.Shapes.AddLine([single]($addition.from[0] * 72), [single]($addition.from[1] * 72), [single]($addition.to[0] * 72), [single]($addition.to[1] * 72))
        $shape.Line.ForeColor.RGB = Color-Value $addition.color
        $shape.Line.Weight = [single]$addition.width
        if ($addition.arrow) { $shape.Line.EndArrowheadStyle = 3 }
        continue
      }
      if ($addition.kind -eq 'shape' -or $addition.kind -eq 'polygon') {
        if ($addition.kind -eq 'polygon') {
          $points = $addition.points
          $builder = $slide.Shapes.BuildFreeform(1, [single]($points[0][0] * 72), [single]($points[0][1] * 72))
          for ($p = 1; $p -le $points.Count; $p++) {
            $point = $points[$p % $points.Count]
            $builder.AddNodes(0, 0, [single]($point[0] * 72), [single]($point[1] * 72))
          }
          $shape = $builder.ConvertToShape()
        } else {
          $types = @{ rect = 1; roundRect = 5; ellipse = 9; hexagon = 10; triangle = 7; downArrow = 36; rightArrow = 33; chevron = 52; pentagon = 51 }
          $shape = $slide.Shapes.AddShape($types[$addition.type], [single]($addition.x * 72), [single]($addition.y * 72), [single]($addition.w * 72), [single]($addition.h * 72))
        }
        $shape.Name = 'GeneratedDiagram-' + $shape.Id
        if ($null -eq $addition.fill) { $shape.Fill.Visible = 0 }
        else { $shape.Fill.Solid(); $shape.Fill.ForeColor.RGB = Color-Value $addition.fill }
        $shape.Line.Visible = 0
        if ($addition.line) { $shape.Line.Visible = -1; $shape.Line.ForeColor.RGB = Color-Value $addition.line; $shape.Line.Weight = 1 }
        if ($addition.dash -eq 'dash') { $shape.Line.DashStyle = 4; $shape.Line.Weight = 1.5 }
        continue
      }
      $shape = $slide.Shapes.AddTextbox(1, [single]($addition.x * 72), [single]($addition.y * 72), [single]($addition.w * 72), [single]($addition.h * 72))
      $shape.Name = 'GeneratedText-' + $shape.Id
      $frame = $shape.TextFrame
      $frame.MarginLeft = 0; $frame.MarginRight = 0; $frame.MarginTop = 0; $frame.MarginBottom = 0
      $frame.WordWrap = -1
      $frame.AutoSize = 0
      $frame.TextRange.Text = $addition.text.Replace("`r`n", "`n").Replace("`n", "`r")
      $frame.TextRange.Font.Name = $addition.fontFace
      $frame.TextRange.Font.Size = [single]$addition.fontSize
      $frame.TextRange.Font.Color.RGB = Color-Value $addition.color
      $frame.TextRange.Font.Bold = $(if ($addition.bold) { -1 } else { 0 })
      $frame.TextRange.ParagraphFormat.Bullet.Visible = 0
      $frame.TextRange.ParagraphFormat.SpaceAfter = 10
      if ($null -ne $addition.spaceAfter) { $frame.TextRange.ParagraphFormat.SpaceAfter = [single]$addition.spaceAfter }
      if ($addition.align) { $frame.TextRange.ParagraphFormat.Alignment = @{ left = 1; center = 2; right = 3 }[$addition.align] }
      # PowerPoint can shrink a newly created empty textbox before AutoSize is disabled.
      $shape.TextFrame2.AutoSize = 0
      if ($addition.valign) { $shape.TextFrame2.VerticalAnchor = @{ top = 1; middle = 3; bottom = 4 }[$addition.valign] }
      $shape.Left = [single]($addition.x * 72)
      $shape.Top = [single]($addition.y * 72)
      $shape.Width = [single]($addition.w * 72)
      $shape.Height = [single]($addition.h * 72)
      if ($shape.TextFrame2.TextRange.BoundHeight -gt $shape.Height + 2) { throw ('Texto nao cabe no slide {0}: altura {1}, caixa {2}x{3}, fonte {4}. Texto: {5}' -f $slide.SlideIndex, $shape.TextFrame2.TextRange.BoundHeight, $shape.Width, $shape.Height, $frame.TextRange.Font.Size, $addition.text) }
    }
  }
  foreach ($id in $originalIds) { $presentation.Slides.FindBySlideID([int]$id).Delete() }
  if ($presentation.Slides.Count -ne $plan.slides.Count) { throw 'Quantidade de slides diferente do plano.' }
  $presentation.SaveAs($OutputPath, 24)
  Write-Output ('Template generated: {0} slides.' -f $presentation.Slides.Count)
} finally {
  if ($null -ne $presentation) {
    $presentation.Saved = -1
    $presentation.Close()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
  }
  if ($null -ne $application) {
    if ($application.Presentations.Count -eq 0) { $application.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($application)
  }
}
