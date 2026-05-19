$log = 'C:\temp\excel_log.txt'
'start' | Out-File $log -Encoding utf8

$local = 'C:\temp\financials'
$xlsxFiles = @('2024 Cost Modeling.xlsx','Background Status Report-Apr 7 2024.xlsx','Background Status Report-Mar 20 2024.xlsx','Subscriptions.xlsx')

foreach ($f in $xlsxFiles) {
    $p = "$local\$f"
    "exists $($f): $(Test-Path $p)" | Add-Content $log
}

Get-Process EXCEL -ErrorAction SilentlyContinue | Stop-Process -Force
'killed excel' | Add-Content $log

try {
    $excel = New-Object -ComObject Excel.Application
    'excel created' | Add-Content $log
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.AskToUpdateLinks = $false
    $excel.AutomationSecurity = 1

    foreach ($f in $xlsxFiles) {
        $path = "$local\$f"
        "opening: $path" | Add-Content $log
        $wb = $excel.Workbooks.Open($path, 0, $false)
        "opened ok: $f" | Add-Content $log
        $wb.Save()
        $wb.Close($false)
        "saved: $f" | Add-Content $log
    }
    $excel.Quit()
    'excel done' | Add-Content $log
} catch {
    "ERROR: $_" | Add-Content $log
}

'finished' | Add-Content $log
Get-Content $log
