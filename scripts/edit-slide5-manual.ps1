param(
  [Parameter(Mandatory=$true)][string]$PptxPath
)
$ErrorActionPreference = 'Stop'

function Color-Value([string]$hex) {
  $r = [Convert]::ToInt32($hex.Substring(0,2),16)
  $g = [Convert]::ToInt32($hex.Substring(2,2),16)
  $b = [Convert]::ToInt32($hex.Substring(4,2),16)
  return $r + ($g * 256) + ($b * 65536)
}

function Set-TextBox($shape, [string]$text, [single]$x, [single]$y, [single]$w, [single]$h, [single]$fontSize, [string]$color, [bool]$bold, [int]$verticalAnchor) {
  $shape.Left = $x * 72; $shape.Top = $y * 72; $shape.Width = $w * 72; $shape.Height = $h * 72
  $shape.TextFrame.AutoSize = 0; $shape.TextFrame.WordWrap = -1
  $shape.TextFrame.MarginLeft = 0; $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0; $shape.TextFrame.MarginBottom = 0
  $shape.TextFrame.TextRange.Text = $text.Replace("`n", "`r")
  $shape.TextFrame.TextRange.Font.Name = 'Open Sans'
  $shape.TextFrame.TextRange.Font.Size = $fontSize
  $shape.TextFrame.TextRange.Font.Color.RGB = Color-Value $color
  $shape.TextFrame.TextRange.Font.Bold = $(if ($bold) { -1 } else { 0 })
  $shape.TextFrame.TextRange.ParagraphFormat.Alignment = 1
  $shape.TextFrame.TextRange.ParagraphFormat.Bullet.Visible = 0
  $shape.TextFrame.TextRange.ParagraphFormat.SpaceAfter = 0
  $shape.TextFrame2.AutoSize = 0
  $shape.TextFrame2.VerticalAnchor = $verticalAnchor
}

function Find-ShapeById($shapes, [int]$id) {
  for ($i = 1; $i -le $shapes.Count; $i++) {
    $candidate = $shapes.Item($i)
    if ($candidate.Id -eq $id) { return $candidate }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($candidate)
  }
  throw "Shape $id não encontrado."
}

$application = $null
$presentation = $null
try {
  $application = New-Object -ComObject PowerPoint.Application
  $presentation = $application.Presentations.Open($PptxPath, 0, 0, 0)
  $slide = $presentation.Slides.Item(5)

  $columns = @(
    @{ bodyId=6; listId=8; lineId=7; x=.65; body='Realizar a migração da forma planejada com a integração e refinamento completo dos workspaces faltantes.'; bullets="• Apoio do time de segurança e jurídico`n• Colaboração das áreas de negócio`n• Chances reais de não ser concluído"; textColor='005AAB'; lineColor='005AAB' },
    @{ bodyId=13; listId=15; lineId=14; x=4.83; body='Realizar a migração da forma que os painéis estão hoje, desligando abruptamente os workspaces paralelos e não permitindo refinamentos.'; bullets="• Apoio do time de segurança e jurídico`n• Áreas de negócio cientes dos riscos`n• Conclusão será realizada"; textColor='002165'; lineColor='FCE500' },
    @{ bodyId=20; listId=22; lineId=21; x=9.01; body='Falta de apoio e priorização do projeto nada poderá avançar.'; bullets="• Sem apoio time de segurança e jurídico`n• Áreas de negócio cientes da realidade`n• Projeto sem prioridade para a empresa"; textColor='B32C35'; lineColor='B32C35' }
  )

  foreach ($column in $columns) {
    $body = Find-ShapeById $slide.Shapes $column.bodyId
    $list = Find-ShapeById $slide.Shapes $column.listId
    $line = Find-ShapeById $slide.Shapes $column.lineId
    Set-TextBox $body $column.body $column.x 2.72 3.63 2.05 17 '172B42' $false 3
    Set-TextBox $list $column.bullets $column.x 5.17 3.63 1.35 14.5 $column.textColor $false 1
    $line.Left = $column.x * 72; $line.Top = 4.98 * 72; $line.Width = 3.6 * 72
    $line.Line.ForeColor.RGB = Color-Value $column.lineColor
    $line.Line.Weight = 2.5
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($body)
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($list)
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($line)
  }

  $presentation.Save()
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
