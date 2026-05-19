$cred = New-Object System.Management.Automation.PSCredential('john', (ConvertTo-SecureString 'Kickers1' -AsPlainText -Force))
New-PSDrive -Name X -PSProvider FileSystem -Root '\\192.168.50.7\backup' -Credential $cred -ErrorAction Stop | Out-Null

$nas = 'X:\ncll\ncll_financials'
$local = 'C:\temp\financials'
$log = 'C:\temp\convert_log.txt'
New-Item -ItemType Directory -Path $local -Force | Out-Null
'Started' | Out-File $log -Encoding utf8

$docFiles = @('Donation Receipt.doc')
$docxFiles = @('2023-Budgeting Guidelines.docx','Donation Page wQR Codes.docx','Donation Receipt.docx','PO Box Authorization.docx')
$xlsxFiles = @('2024 Cost Modeling.xlsx','Background Status Report-Apr 7 2024.xlsx','Background Status Report-Mar 20 2024.xlsx','Subscriptions.xlsx')

# Copy all files to local
foreach ($f in ($docFiles + $docxFiles + $xlsxFiles)) {
    Copy-Item "$nas\$f" "$local\$f" -Force
    "Copied: $f" | Add-Content $log
}

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    # Convert .doc -> .docx
    foreach ($f in $docFiles) {
        $src = "$local\$f"
        $dst = "$local\" + ($f -replace '\.doc$', ' (converted).docx')
        "Converting: $f" | Add-Content $log
        $doc = $word.Documents.Open($src)
        $doc.SaveAs2($dst, 12)
        $doc.Close(0)
        "Converted OK: $f" | Add-Content $log
    }

    # Resave .docx with thumbnail
    foreach ($f in $docxFiles) {
        $path = "$local\$f"
        "Resaving: $f" | Add-Content $log
        $doc = $word.Documents.Open($path)
        $doc.Save()
        $doc.Close(0)
        "Resaved OK: $f" | Add-Content $log
    }
    $word.Quit()
    'Word done' | Add-Content $log
} catch {
    "WORD ERROR: $_" | Add-Content $log
}

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.AskToUpdateLinks = $false
    $excel.AutomationSecurity = 1  # msoAutomationSecurityLow — bypass macro/link dialogs

    foreach ($f in $xlsxFiles) {
        $path = "$local\$f"
        "Resaving xlsx: $f" | Add-Content $log
        $wb = $excel.Workbooks.Open($path, 0, $false)  # UpdateLinks=0, ReadOnly=false
        $wb.Save()
        $wb.Close($false)
        "Resaved OK: $f" | Add-Content $log
    }
    $excel.Quit()
    'Excel done' | Add-Content $log
} catch {
    "EXCEL ERROR: $_" | Add-Content $log
}

# Copy results back to NAS
foreach ($f in $docxFiles) {
    Copy-Item "$local\$f" "$nas\$f" -Force
    "Pushed back: $f" | Add-Content $log
}
foreach ($f in $xlsxFiles) {
    Copy-Item "$local\$f" "$nas\$f" -Force
    "Pushed back: $f" | Add-Content $log
}
# Push converted .docx back
$converted = 'Donation Receipt (converted).docx'
Copy-Item "$local\$converted" "$nas\$converted" -Force
"Pushed back: $converted" | Add-Content $log

'Finished' | Add-Content $log
Get-Content $log
