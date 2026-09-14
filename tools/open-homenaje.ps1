param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$loopback = '127.0.0.1'

function Test-HomenajeServer {
    param([int]$Port)

    try {
        $response = Invoke-WebRequest -Uri "http://${loopback}:$Port/es/juego.html" -UseBasicParsing -TimeoutSec 1
        return $response.StatusCode -eq 200 -and $response.Content -match '<title>El juego'
    }
    catch {
        return $false
    }
}

function Get-ListeningPorts {
    return [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners().Port
}

$port = 8765
$reuseServer = Test-HomenajeServer -Port $port

if (-not $reuseServer) {
    $listeningPorts = @(Get-ListeningPorts)
    $port = 8765..8799 | Where-Object { $_ -notin $listeningPorts } | Select-Object -First 1
    if (-not $port) {
        throw 'No hay ningún puerto disponible entre 8765 y 8799.'
    }

    $python = Get-Command python.exe -ErrorAction SilentlyContinue
    $arguments = @('-m', 'http.server', [string]$port, '--bind', $loopback)
    if (-not $python) {
        $python = Get-Command py.exe -ErrorAction SilentlyContinue
        $arguments = @('-3', '-m', 'http.server', [string]$port, '--bind', $loopback)
    }
    if (-not $python) {
        throw 'Python 3 no está instalado o no aparece en PATH.'
    }

    $server = Start-Process -FilePath $python.Source -ArgumentList $arguments -WorkingDirectory $siteRoot -WindowStyle Hidden -PassThru
    $ready = $false
    for ($attempt = 0; $attempt -lt 50; $attempt++) {
        Start-Sleep -Milliseconds 100
        if (Test-HomenajeServer -Port $port) {
            $ready = $true
            break
        }
        if ($server.HasExited) {
            break
        }
    }
    if (-not $ready) {
        if (-not $server.HasExited) {
            Stop-Process -Id $server.Id
        }
        throw "El servidor local no pudo iniciarse en el puerto $port."
    }
}

if (-not $NoBrowser) {
    Start-Process "http://${loopback}:$port/"
}
