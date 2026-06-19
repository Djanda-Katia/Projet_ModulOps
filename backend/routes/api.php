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
Route::post('/password/forgot', [AuthController::class, 'reinitialiserMotDePasse']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// 2. ROUTES PROTÉGÉES PAR SANCTUM
Route::middleware('auth:sanctum')->group(function () {

    // Auth & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- DASHBOARD (le contrôleur filtre les données selon le rôle connecté) ---
    Route::get('/dashboard', [DashboardController::class, 'getDashboard']);

    // --- MODULE TICKETS ---
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/commentaires', [TicketController::class, 'ajouterCommentaire']);
    Route::post('/tickets/{id}/confirmer', [TicketController::class, 'confirmerResolution']);
    Route::post('/tickets/{id}/signaler', [TicketController::class, 'signalerProbleme']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);

    // Route pour récupérer la liste des techniciens disponibles (attribution manuelle)
    Route::get('/techniciens', function () {
        return \App\Models\User::where('role_id', 3)->get(['id', 'nom', 'prenom']);
    });

    // Historique des commentaires d'un ticket
    Route::get('/tickets/{id}/commentaires', function ($id) {
        $ticket = \App\Models\Ticket::findOrFail($id);
        if (Auth::id() !== $ticket->user_id && Auth::id() !== $ticket->technicien_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        return $ticket->commentaires()->orderBy('created_at', 'asc')->get();
    });

    // --- MODULE GESTION DES CONGÉS ---
    Route::get('/conges', [CongeController::class, 'index']);
    Route::post('/conges/demande', [CongeController::class, 'soumettreDemande']);
    Route::post('/conges/decider/{id}', [CongeController::class, 'decider'])->middleware('role:2');

    // --- MODULE TÂCHES ---
    Route::middleware('role:1,2')->group(function () {
        Route::get('/mes-taches', [TacheController::class, 'mesTaches']);
        Route::patch('/taches/{id}/statut', [TacheController::class, 'updateStatut']);
        Route::get('/toutes-taches', [TacheController::class, 'allTasks'])->middleware('role:2');
    });

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
        Route::patch('/taches/{id}/valider', [TacheController::class, 'validerTerminaison']);
        Route::patch('/taches/{id}/annuler', [TacheController::class, 'annulerTerminaison']); // NOUVEAU
    });

    // --- ACCÈS RÉSERVÉS UNIQUEMENT À L'ADMINISTRATEUR (Rôle 4) ---
    Route::middleware('role:4')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'index']);
        Route::post('/admin/users', [AdminController::class, 'store']);
        Route::patch('/admin/users/{id}/role', [AdminController::class, 'modifierRole']);
        Route::get('/admin/audit/export', [AdminController::class, 'exporterAudit']);
    });
    Route::get('/employes', function () {
        return \App\Models\User::where('role_id', 1)->get(['id', 'nom', 'prenom']);
        })->middleware('auth:sanctum');    

    
});