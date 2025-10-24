Param(
	[Parameter(Mandatory=$true)] [string] $MySqlHost,           # e.g., hospital-mysql-server.mysql.database.azure.com
	[Parameter(Mandatory=$true)] [int]    $MySqlPort,           # e.g., 3306
	[Parameter(Mandatory=$true)] [string] $MySqlDatabase,       # e.g., hospital_management
	[Parameter(Mandatory=$true)] [string] $MySqlUser,           # e.g., adminuser_hms
	[Parameter(Mandatory=$true)] [string] $MySqlPassword,       # secure password
	[Parameter(Mandatory=$false)] [switch] $SkipFrontend,
	[Parameter(Mandatory=$false)] [switch] $SkipApi,
	[Parameter(Mandatory=$false)] [switch] $IncludeE2E,
	[Parameter(Mandatory=$false)] [switch] $IncludePerf
)

$ErrorActionPreference = 'Stop'

# Basic placeholder validation to prevent accidental runs with <host>/<user>/<pwd>
function Confirm-NotPlaceholder {
    param(
        [string]$Name,
        [string]$Value
    )
    if ([string]::IsNullOrWhiteSpace($Value) -or $Value.Trim() -match '^<.+>$') {
        throw "Parameter '$Name' looks like a placeholder ('$Value'). Please provide a real Azure MySQL $Name."
    }
}

Confirm-NotPlaceholder -Name 'MySqlHost' -Value $MySqlHost
Confirm-NotPlaceholder -Name 'MySqlUser' -Value $MySqlUser
Confirm-NotPlaceholder -Name 'MySqlPassword' -Value $MySqlPassword

Write-Host "[1/7] Checking for MySQL client(s)..." -ForegroundColor Cyan
$hasMysql = $null -ne (Get-Command mysql -ErrorAction SilentlyContinue)
$hasMysqlsh = $null -ne (Get-Command mysqlsh -ErrorAction SilentlyContinue)
if (-not $hasMysql -and -not $hasMysqlsh) {
	Write-Host "Neither 'mysql' nor 'mysqlsh' found in PATH." -ForegroundColor Red
	Write-Host "Install one of the following and re-run:" -ForegroundColor Yellow
	Write-Host "  winget install Oracle.MySQLShell   # mysqlsh (recommended)" -ForegroundColor Yellow
	Write-Host "  winget install Oracle.MySQL        # includes MySQL client" -ForegroundColor Yellow
	throw "MySQL client not found in PATH."
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\unit') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\api') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\e2e') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\frontend') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\qa') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\e2e') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $root 'reports\test-runs\perf') | Out-Null

$schemaPath = Join-Path $root 'database\schema.sql'
$seedPath   = Join-Path $root 'database\seed_data.sql'

# Helpers
function Wait-HttpReady {
	param(
		[string]$Url,
		[int]$TimeoutSec = 45
	)
	for ($i=0; $i -lt $TimeoutSec; $i++) {
		try {
			$resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
			if ($resp.StatusCode -ge 200) { return $true }
		} catch { Start-Sleep -Seconds 1 }
	}
	return $false
}

function Start-BackendApi {
	param(
		[string]$WorkingDir,
		[string]$Url = 'http://localhost:5239/swagger'
	)
	$proc = Start-Process -FilePath 'dotnet' -ArgumentList 'run' -WorkingDirectory $WorkingDir -PassThru
	if (-not (Wait-HttpReady -Url $Url -TimeoutSec 45)) {
		try { if ($proc -and !$proc.HasExited) { $proc.Kill() | Out-Null } } catch {}
		throw "Backend API did not become ready at $Url within timeout."
	}
	return $proc
}

function Start-FrontendDev {
	param(
		[string]$WorkingDir,
		[string]$Url = 'http://localhost:3000/',
		[int]$TimeoutSec = 60
	)
	if (-not (Test-Path (Join-Path $WorkingDir 'node_modules'))) {
		Push-Location $WorkingDir
		try {
			if (Test-Path 'package-lock.json') { npm ci } else { npm install }
		} finally { Pop-Location }
	}
	$npmExe = ($env:OS -eq 'Windows_NT') ? 'npm.cmd' : 'npm'
	$proc = Start-Process -FilePath $npmExe -ArgumentList 'start' -WorkingDirectory $WorkingDir -PassThru
	if (-not (Wait-HttpReady -Url $Url -TimeoutSec $TimeoutSec)) {
		try { if ($proc -and !$proc.HasExited) { $proc.Kill() | Out-Null } } catch {}
		throw "Frontend did not become ready at $Url within timeout."
	}
	return $proc
}

function Invoke-MySqlScript {
	param(
		[string]$ScriptPath,
		[string]$Db,
		[switch]$NoDb
	)

	if ($hasMysql) {
		# Use input redirection via cmd to avoid quoting issues
		$baseArgs = @("--host=$MySqlHost","--port=$MySqlPort","--user=$MySqlUser","--password=$MySqlPassword","--ssl-mode=REQUIRED","--protocol=TCP")
		if (-not $NoDb) { $baseArgs += "--database=$Db" }
		$argString = $baseArgs -join ' '
		$cmd = "mysql $argString < `"$ScriptPath`""
		Write-Host "mysql executing: $ScriptPath (NoDb=$($NoDb.IsPresent))" -ForegroundColor DarkCyan
		cmd /c $cmd | Write-Host
	}
	elseif ($hasMysqlsh) {
		# mysqlsh supports --file in SQL mode
		$baseArgs = @("--sql","--host=$MySqlHost","--port=$MySqlPort","--user=$MySqlUser","--password=$MySqlPassword","--ssl-mode=REQUIRED")
		if (-not $NoDb) { $baseArgs += "--schema=$Db" }
		$baseArgs += @("--file","$ScriptPath")
		Write-Host "mysqlsh executing: $ScriptPath (NoDb=$($NoDb.IsPresent))" -ForegroundColor DarkCyan
		& mysqlsh @baseArgs | Write-Host
	}
}

function Invoke-MySqlQuerySingleValue {
	param(
		[string]$Sql,
		[string]$Db
	)
	$tmp = Join-Path $env:TEMP ("query_" + [System.IO.Path]::GetRandomFileName() + ".sql")
	$Sql | Set-Content -Path $tmp -Encoding UTF8
	try {
		if ($hasMysql) {
			$mysqlArgs = @("--host=$MySqlHost","--port=$MySqlPort","--user=$MySqlUser","--password=$MySqlPassword","--ssl-mode=REQUIRED","--protocol=TCP","--batch","--skip-column-names","--database=$Db")
			$argString = $mysqlArgs -join ' '
			$cmd = "mysql $argString < `"$tmp`""
			$out = cmd /c $cmd
			return ($out | Select-Object -First 1)
		} elseif ($hasMysqlsh) {
			$mysqlshArgs = @("--sql","--host=$MySqlHost","--port=$MySqlPort","--user=$MySqlUser","--password=$MySqlPassword","--ssl-mode=REQUIRED","--schema=$Db","--file=$tmp")
			$out = & mysqlsh @mysqlshArgs
			# mysqlsh prints prompts sometimes; take the last numeric line
			$val = ($out | Where-Object { $_ -match '^[0-9]+$' } | Select-Object -Last 1)
			if (-not $val) { $val = ($out | Select-Object -Last 1) }
			return $val
		}
	} finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
}

Write-Host "[2/7] Ensuring database exists: $MySqlDatabase" -ForegroundColor Cyan
$createDbScript = Join-Path $env:TEMP ("create_db_" + [System.IO.Path]::GetRandomFileName() + ".sql")
$sql = "CREATE DATABASE IF NOT EXISTS $MySqlDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$sql | Set-Content -Path $createDbScript -Encoding UTF8
Invoke-MySqlScript -ScriptPath $createDbScript -Db $MySqlDatabase -NoDb
Remove-Item $createDbScript -Force -ErrorAction SilentlyContinue

Write-Host "[3/7] Applying schema to Azure MySQL: $MySqlHost/$MySqlDatabase" -ForegroundColor Cyan
Invoke-MySqlScript -ScriptPath $schemaPath -Db $MySqlDatabase

Write-Host "[4/7] Seeding data into Azure MySQL..." -ForegroundColor Cyan
Invoke-MySqlScript -ScriptPath $seedPath -Db $MySqlDatabase

# Verify seeded users exist to avoid 401 during login
try {
	$u1 = Invoke-MySqlQuerySingleValue -Sql "SELECT COUNT(*) FROM Users WHERE Email='testuser@example.com';" -Db $MySqlDatabase
	$u2 = Invoke-MySqlQuerySingleValue -Sql "SELECT COUNT(*) FROM Users WHERE Email='testuser2@example.com';" -Db $MySqlDatabase
	if ([int]$u1 -lt 1 -or [int]$u2 -lt 1) {
		throw "Seed verification failed: Expected seeded users not found (testuser@example.com/testuser2@example.com)."
	}
	Write-Host "Seed verification OK: users present." -ForegroundColor DarkGreen
} catch {
	Write-Host $_.Exception.Message -ForegroundColor Red
	throw "Database seeding did not complete correctly; cannot proceed with auth/login tests."
}

# Force-reset seeded users' password hash to expected value ('Test@123') to avoid stale rows blocking login
$knownBcrypt = '$2a$10$8SxpuYk1zqHn0KzFMsf7VOwxhA8o1H8O6m2Zg19hS8QJY0l2K2bRO'
$resetSql = @(
	"UPDATE Users SET PasswordHash='$knownBcrypt', IsActive=1 WHERE Email IN ('testuser@example.com','testuser2@example.com');"
) -join "`n"
$tmpReset = Join-Path $env:TEMP ("reset_pwd_" + [System.IO.Path]::GetRandomFileName() + ".sql")
$resetSql | Set-Content -Path $tmpReset -Encoding UTF8
Invoke-MySqlScript -ScriptPath $tmpReset -Db $MySqlDatabase
Remove-Item $tmpReset -Force -ErrorAction SilentlyContinue
Write-Host "Seeded user passwords reset to known test value (Test@123)." -ForegroundColor DarkGreen

Write-Host "[5/7] Running backend unit/integration tests..." -ForegroundColor Cyan
Push-Location (Join-Path $root 'backend')
dotnet restore | Write-Host
# Set the HMS_AZURE_MYSQL environment variable
$env:HMS_AZURE_MYSQL = "Server=$MySqlHost;Port=$MySqlPort;Database=$MySqlDatabase;User Id=$MySqlUser;Password=$MySqlPassword;SslMode=Required;"

# Also set the ASP.NET Core connection string override (env vars take precedence over appsettings)
$env:ConnectionStrings__DefaultConnection = $env:HMS_AZURE_MYSQL

# Tests will use HMS_AZURE_MYSQL/ConnectionStrings__DefaultConnection env var for DB access
Write-Host "Using connection string from environment variables (HMS_AZURE_MYSQL)." -ForegroundColor Yellow
if (Test-Path '.\Tests\Backend.IntegrationTests\Backend.IntegrationTests.csproj') {
	dotnet test .\Tests\Backend.IntegrationTests\Backend.IntegrationTests.csproj --logger "trx;LogFileName=..\\..\\reports\\test-runs\\unit\\integration.trx"
} else {
	dotnet test --logger "trx;LogFileName=..\\reports\\test-runs\\unit\\unit.trx"
}
Pop-Location

if (-not $SkipApi) {
	Write-Host "[6/7] Starting backend API and running API tests (Newman/Postman)..." -ForegroundColor Cyan
	# Start backend API in background
	$apiUrl = 'http://localhost:5239'
	$backendProc = Start-BackendApi -WorkingDir (Join-Path $root 'backend') -Url "$apiUrl/swagger"
	try {
		Write-Host "API presumably ready at $apiUrl" -ForegroundColor DarkGreen
    
		# Run Postman
	$postman = Join-Path $root 'tests\api\appointments.postman_collection.json'
	$envFile = Join-Path $root 'tests\api\env.qa.json'
	if (Test-Path $postman) {
		# Provide dynamic dates (tomorrow+7 days, etc.) via environment vars Newman's CLI can consume.
		$bookDate = (Get-Date).AddDays(1).ToString('yyyy-MM-dd')
		$reschedDate = (Get-Date).AddDays(2).ToString('yyyy-MM-dd')
		Write-Host "Using bookDate=$bookDate rescheduleDate=$reschedDate" -ForegroundColor DarkYellow
	$npxExe = ($env:OS -eq 'Windows_NT') ? 'npx.cmd' : 'npx'
	& $npxExe newman run $postman -e $envFile --env-var dynamic_bookDate=$bookDate --env-var dynamic_rescheduleDate=$reschedDate -r junit --reporter-junit-export (Join-Path $root 'reports\test-runs\api\results.xml')
	} else {
		Write-Host "No Postman collection found at tests\\api\\appointments.postman_collection.json. Skipping." -ForegroundColor Yellow
	}
	} finally {
		if ($backendProc -and !$backendProc.HasExited) { $backendProc.Kill() | Out-Null }
	}
}

if (-not $SkipFrontend) {
			Write-Host "[7/7] Running frontend unit tests..." -ForegroundColor Cyan
	Push-Location (Join-Path $root 'frontend')
	if (Test-Path 'package.json') {
			if (-not (Test-Path 'node_modules')) {
				if (Test-Path 'package-lock.json') { npm ci } else { npm install }
			}
				$env:CI = 'true'
				# Ensure cross-env exists for Windows environments
				if (-not (Test-Path 'node_modules/cross-env')) {
					npm install --save-dev cross-env
				}
				npm run test:ci
	} else {
		Write-Host "No frontend detected. Skipping UI tests." -ForegroundColor Yellow
	}
	Pop-Location
}

# Optional E2E (Selenium) run
if ($IncludeE2E) {
	Write-Host "[8/8] Running E2E (Selenium) appointment booking..." -ForegroundColor Cyan
	$e2eDir = Join-Path $root 'tests\e2e'
	$venv = Join-Path $e2eDir '.venv'
	$py = Get-Command python -ErrorAction SilentlyContinue
	if (-not $py) { Write-Warning "Python not found in PATH. Skipping E2E." }
	else {
		# Ensure backend and frontend are running for E2E
		$apiUrl = 'http://localhost:5239'
		# Probe for 3000, fallback to 3001 if occupied
		$preferredPorts = @('3000','3001')
		$chosenPort = $null
		foreach ($p in $preferredPorts) {
			try {
				$tcp = New-Object System.Net.Sockets.TcpClient
				$async = $tcp.BeginConnect('localhost', [int]$p, $null, $null)
				$completed = $async.AsyncWaitHandle.WaitOne(250)
				if ($completed -and $tcp.Connected) {
					# In use; try next
					$tcp.Close(); continue
				} else {
					$tcp.Close(); $chosenPort = $p; break
				}
			} catch { $chosenPort = $p; break }
		}
		if (-not $chosenPort) { $chosenPort = '3000' }
		$frontendUrl = "http://localhost:$chosenPort/"
		$backendE2E = $null
		$frontendProc = $null
		try {
			$backendE2E = Start-BackendApi -WorkingDir (Join-Path $root 'backend') -Url "$apiUrl/swagger"
			# Pass API base to React app so it calls correct backend
			$env:REACT_APP_API_BASE = $apiUrl
			# Enforce consistent port and prevent auto-launching browser
			$env:PORT = $chosenPort
			$env:BROWSER = 'none'
			$frontendProc = Start-FrontendDev -WorkingDir (Join-Path $root 'frontend') -Url $frontendUrl -TimeoutSec 180

			Push-Location $e2eDir
			# Python venv and dependencies
			if (-not (Test-Path $venv)) { python -m venv .venv }
			$pythonExe = Join-Path $venv 'Scripts\python.exe'
			& $pythonExe -m pip install --upgrade pip | Write-Host
			& $pythonExe -m pip install -r requirements.txt | Write-Host
			$logPath = Join-Path $root 'reports\test-runs\e2e\booking_log.txt'
			$env:FRONTEND_URL = $frontendUrl
			$env:PATIENT_EMAIL = 'testuser2@example.com'
			$env:PATIENT_PASSWORD = 'Test@123'
			& $pythonExe 'e2e_book_appointment.py' *>&1 | Tee-Object -FilePath $logPath
		} finally {
			try { Pop-Location } catch {}
			try { if ($frontendProc -and !$frontendProc.HasExited) { $frontendProc.Kill() | Out-Null } } catch {}
			try { if ($backendE2E -and !$backendE2E.HasExited) { $backendE2E.Kill() | Out-Null } } catch {}
		}
	}
}

# Optional Performance (JMeter) run
if ($IncludePerf) {
	Write-Host "[9/9] Running performance tests (JMeter)..." -ForegroundColor Cyan
	$jmeter = Get-Command jmeter -ErrorAction SilentlyContinue
	if (-not $jmeter) {
		Write-Warning "Apache JMeter not found in PATH. Install and ensure 'jmeter' is available to run performance tests. Skipping perf."
	}
	else {
		$perfDir = Join-Path $root 'tests\perf'
		$outDir = Join-Path $root 'reports\test-runs\perf'
		$jtl1 = Join-Path $outDir 'booking_results.jtl'
		$jtl2 = Join-Path $outDir 'history_results.jtl'
		& jmeter -n -t (Join-Path $perfDir 'booking_test.jmx') -l $jtl1 -JBASE_URL='http://localhost:5239' | Write-Host
		& jmeter -n -t (Join-Path $perfDir 'history_test.jmx') -l $jtl2 -JBASE_URL='http://localhost:5239' | Write-Host
	}
}

Write-Host "All test steps completed." -ForegroundColor Green

	# Generate consolidated test summary (Markdown)
	try {
		Write-Host "Generating test summary (reports/test-summary.md)..." -ForegroundColor Cyan

		function Get-TrxCounters {
			param([string]$Path)
			if (-not (Test-Path $Path)) { return $null }
			$xml = [xml](Get-Content -LiteralPath $Path)
			$c = $xml.TestRun.ResultSummary.Counters
			if ($null -eq $c) { return $null }
			return @{ 
				total = [int]$c.total; executed = [int]$c.executed; passed = [int]$c.passed; failed = [int]$c.failed; notExecuted = [int]$c.notExecuted 
			}
		}

		function Get-JUnitCounters {
			param([string]$Path)
			if (-not (Test-Path $Path)) { return $null }
			$xml = [xml](Get-Content -LiteralPath $Path)
			$tests = 0; $failures = 0; $errors = 0; $skipped = 0
			if ($xml.testsuite) {
				$ts = $xml.testsuite
				$tests = [int]($ts.tests)
				$failures = [int]($ts.failures)
				$errors = [int]($ts.errors)
				$skipped = [int]($ts.skipped)
			} elseif ($xml.testsuites) {
				foreach ($ts in $xml.testsuites.testsuite) {
					$tests += [int]($ts.tests)
					$failures += [int]($ts.failures)
					$errors += [int]($ts.errors)
					$skipped += [int]($ts.skipped)
				}
			}
			return @{ tests = $tests; failures = $failures; errors = $errors; skipped = $skipped }
		}

		$root = Split-Path -Parent $MyInvocation.MyCommand.Path
		$summaryPath = Join-Path $root 'reports\test-summary.md'
		$trxPath = Join-Path $root 'reports\test-runs\unit\integration.trx'
		$apiPath = Join-Path $root 'reports\test-runs\api\results.xml'
		$fePath = Join-Path $root 'reports\test-runs\frontend\junit.xml'
		$qaCsvSrc = Join-Path $root 'reports\QA\appointments_test_cases.csv'
		$qaCsvDst = Join-Path $root 'reports\test-runs\qa\appointments_test_cases.csv'
		if (Test-Path $qaCsvSrc) { Copy-Item -LiteralPath $qaCsvSrc -Destination $qaCsvDst -Force }
        $e2eLog = Join-Path $root 'reports\test-runs\e2e\booking_log.txt'
        $perfDir = Join-Path $root 'reports\test-runs\perf'

		$b = Get-TrxCounters -Path $trxPath
		$a = Get-JUnitCounters -Path $apiPath
		$f = Get-JUnitCounters -Path $fePath

		$lines = @()
		$lines += "# Test Summary"
		$lines += ""
		$lines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
		$lines += ""
		$lines += "Environment:"
		$lines += "- Azure MySQL Host: $MySqlHost"
		$lines += "- Database: $MySqlDatabase"
		$lines += ""
		$lines += "## Results"
		$lines += ""
		if ($b) {
			$lines += "- Backend Integration (TRX): total=$($b.total), passed=$($b.passed), failed=$($b.failed), skipped=$($b.notExecuted)"
		} else {
			$lines += "- Backend Integration (TRX): no results"
		}
		if ($a) {
			$lines += "- API (Postman JUnit): tests=$($a.tests), failures=$($a.failures), errors=$($a.errors), skipped=$($a.skipped)"
		} else {
			$lines += "- API (Postman JUnit): no results"
		}
		if ($f) {
			$lines += "- Frontend (Jest JUnit): tests=$($f.tests), failures=$($f.failures), errors=$($f.errors), skipped=$($f.skipped)"
		} else {
			$lines += "- Frontend (Jest JUnit): no results"
		}
		$lines += ""
		$lines += "## Artifacts"
		$lines += "- Backend TRX: reports/test-runs/unit/integration.trx"
		$lines += "- API JUnit: reports/test-runs/api/results.xml"
		$lines += "- Frontend JUnit: reports/test-runs/frontend/junit.xml"
		if (Test-Path $qaCsvDst) { $lines += "- Test Cases CSV: reports/test-runs/qa/appointments_test_cases.csv" }
        if (Test-Path $e2eLog) { $lines += "- E2E Log: reports/test-runs/e2e/booking_log.txt" }
		if (Test-Path $perfDir) { $lines += "- Perf Results (JTL): reports/test-runs/perf/booking_results.jtl, history_results.jtl" }

		$lines -join "`r`n" | Set-Content -LiteralPath $summaryPath -Encoding UTF8
		Write-Host "Summary written to $summaryPath" -ForegroundColor Green
	} catch {
		Write-Warning "Failed to generate summary: $($_.Exception.Message)"
	}

