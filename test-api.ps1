# Script de test pour l'API des donations
Write-Host "=== Test de l'API des donations ===" -ForegroundColor Green

$baseUrl = "http://localhost:3001/api"

# Test 1: Health check
Write-Host "`n1. Test du health check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✓ Health check: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n2. Test de l'authentification..." -ForegroundColor Yellow
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -ContentType "application/json" -Body $loginData
    $token = $loginResponse.token
    Write-Host "✓ Login réussi, token obtenu" -ForegroundColor Green
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers avec token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: Dashboard
Write-Host "`n3. Test du dashboard..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$baseUrl/dashboard" -Method GET -Headers $headers
    Write-Host "✓ Dashboard: Total du jour = $($dashboard.totalAmount) DA" -ForegroundColor Green
} catch {
    Write-Host "✗ Dashboard failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Projets
Write-Host "`n4. Test des projets..." -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "$baseUrl/projects" -Method GET -Headers $headers
    Write-Host "✓ Projets trouvés: $($projects.Count)" -ForegroundColor Green
    foreach ($project in $projects) {
        Write-Host "  - $($project.name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Projets failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Ajouter une donation
Write-Host "`n5. Test d'ajout de donation..." -ForegroundColor Yellow
try {
    $donationData = @{
        donor_name = "Test Donateur"
        project_id = 1
        amount = 1000.50
    } | ConvertTo-Json
    
    $donation = Invoke-RestMethod -Uri "$baseUrl/donations" -Method POST -Headers $headers -Body $donationData
    Write-Host "✓ Donation ajoutée: $($donation.donor_name) - $($donation.amount) DA" -ForegroundColor Green
} catch {
    Write-Host "✗ Ajout donation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Historique
Write-Host "`n6. Test de l'historique..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "$baseUrl/donations/history" -Method GET -Headers $headers
    Write-Host "✓ Historique: $($history.Count) jours trouvés" -ForegroundColor Green
} catch {
    Write-Host "✗ Historique failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Tests terminés ===" -ForegroundColor Green
Write-Host "`nL'application est accessible sur: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Compte de test: admin / admin123" -ForegroundColor Cyan
