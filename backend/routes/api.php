<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\TicketController; 
use App\Http\Controllers\TacheController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 1. ROUTES PUBLIQUES
Route::post('/login', [AuthController::class, 'login']);
Route::post('/password/forgot', [AuthController::class, 'reinitialiserMotDePassse']);

// 2. ROUTES PROTÉGÉES
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- DASHBOARD (Accessible à tous, le contrôleur filtre les infos par rôle) ---
    Route::get('/dashboard', [DashboardController::class, 'getDashboard']);

    // --- MODULE TICKETS ---
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/commentaires', [TicketController::class, 'ajouterCommentaire']);
    Route::post('/tickets/{id}/resoudre', [TicketController::class, 'resoudre']);
    Route::post('/tickets/{id}/confirmer', [TicketController::class, 'confirmer']);

    // --- MODULE GESTION DES CONGÉS ---
    Route::get('/conges', [CongeController::class, 'index']);
    Route::post('/conges/demande', [CongeController::class, 'soumettreDemande']);
    Route::post('/conges/decider/{id}', [CongeController::class, 'decider'])->middleware('role:2');

    // --- MODULE TÂCHES ---
    Route::get('/mes-taches', [TacheController::class, 'mesTaches']);
    Route::patch('/taches/{id}/statut', [TacheController::class, 'updateStatut']);

    // --- MODULE NOTIFICATIONS ---
    Route::get('/notifications', function () {
        return \App\Models\Notification::where('destinataire_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
    });

    Route::patch('/notifications/{id}/lu', function (int $id) {
        \App\Models\Notification::where('id', $id)
            ->where('destinataire_id', Auth::id())
            ->update(['lu' => true]);
        return response()->json(['success' => true]);
    });

    // --- ACCÈS RÉSERVÉS AUX RESPONSABLES (Rôle 2) ---
    Route::middleware('role:2')->group(function () {
        Route::post('/taches', [TacheController::class, 'store']);
        // Action métier : Valider la terminaison d'une tâche
        Route::patch('/taches/{id}/valider', [TacheController::class, 'validerTerminaison']);
    });

    // --- ACCÈS RÉSERVÉS UNIQUEMENT A L'ADMINISTRATEUR (Rôle 4) ---
    Route::middleware('role:4')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'index']);
        Route::post('/admin/users', [AdminController::class, 'store']);
        Route::patch('/admin/users/{id}/role', [AdminController::class, 'modifierRole']);
        Route::get('/admin/audit/export', [AdminController::class, 'exporterAudit']);
    });
    
});