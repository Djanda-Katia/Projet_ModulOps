<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CongeController;
use App\Http\Controllers\TicketController; 
use App\Http\Controllers\TacheController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 1. ROUTE PUBLIQUE
Route::post('/login', [AuthController::class, 'login']);

// 2. ROUTES PROTÉGÉES (auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- MODULE TICKETS ---
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/commentaires', [TicketController::class, 'ajouterCommentaire']);
    Route::post('/tickets/{id}/resoudre', [TicketController::class, 'resoudre']);
    Route::post('/tickets/{id}/confirmer', [TicketController::class, 'confirmer']);

    // --- MODULE GESTION DES CONGÉS ---
    Route::get('/conges', [CongeController::class, 'index']);
    Route::post('/conges/demande', [CongeController::class, 'soumettreDemande']);
    Route::post('/conges/decider/{id}', [CongeController::class, 'decider'])->middleware('role:2,4');

    // --- MODULE TÂCHES ---
    Route::get('/mes-taches', [TacheController::class, 'mesTaches']);

    // --- MODULE NOTIFICATIONS ) ---
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

    // --- ACCÈS RÉSERVÉS (RESPONSABLES 2 ET ADMINS 4) ---
    Route::middleware('role:2,4')->group(function () {
        Route::post('/taches', [TacheController::class, 'store']);
    });

    Route::patch('/taches/{id}/statut', [TacheController::class, 'updateStatut']);
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
});

