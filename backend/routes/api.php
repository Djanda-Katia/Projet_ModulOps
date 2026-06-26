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
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/password/forgot', [AuthController::class, 'reinitialiserMotDePasse']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// 2. ROUTES PROTÉGÉES PAR SANCTUM
Route::middleware('auth:sanctum')->group(function () {

    // Auth & Profil
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- DASHBOARD ---
    Route::get('/dashboard', [DashboardController::class, 'getDashboard']);

    // --- MODULE TICKETS ---
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::post('/tickets/{id}/commentaires', [TicketController::class, 'ajouterCommentaire']);
    Route::post('/tickets/{id}/confirmer', [TicketController::class, 'confirmerResolution']);
    Route::post('/tickets/{id}/signaler', [TicketController::class, 'signalerProbleme']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);
    Route::post('/tickets/{id}/fermer', [TicketController::class, 'fermerParAuteur']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::get('/techniciens', function () {
        return \App\Models\User::where('role_id', 3)->get(['id', 'nom', 'prenom']);
    });
    Route::get('/tickets/{id}/commentaires', function ($id) {
        $ticket = \App\Models\Ticket::findOrFail($id);
        if (Auth::id() !== $ticket->user_id && Auth::id() !== $ticket->technicien_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        return $ticket->commentaires()->with('auteur')->orderBy('created_at', 'asc')->get();
    });

    // --- MODULE GESTION DES CONGÉS ---
    Route::get('/conges', [CongeController::class, 'index']);
    Route::post('/conges/demande', [CongeController::class, 'soumettreDemande']);
    Route::delete('/conges/{id}', [CongeController::class, 'annulerDemande']);
    Route::post('/conges/signaler-responsable', [CongeController::class, 'signalerNonConfigure']);
    Route::post('/conges/decider/{id}', [CongeController::class, 'decider'])->middleware('role:2');

    // --- MODULE TÂCHES ---
    Route::middleware('role:1,2')->group(function () {
        Route::get('/mes-taches', [TacheController::class, 'mesTaches']);
        Route::patch('/taches/{id}/statut', [TacheController::class, 'updateStatut']);
        Route::get('/toutes-taches', [TacheController::class, 'allTasks'])->middleware('role:2');
    });

    Route::get('/notifications', function (Request $request) {
        $query = \App\Models\Notification::where('destinataire_id', Auth::id());

        if ($request->has('statut') && $request->statut !== '') {
            $statuts = explode(',', $request->statut);
            if (in_array('Lu', $statuts) || in_array('lu', $statuts)) {
                $query->where('lu', true);
            } elseif (in_array('Non lu', $statuts) || in_array('non_lu', $statuts)) {
                $query->where('lu', false);
            }
        }

        if ($request->has('dates') && $request->dates) {
            $datesArray = explode(',', $request->dates);
            $query->whereIn(\Illuminate\Support\Facades\DB::raw('DATE(created_at)'), $datesArray);
        }

        if ($request->has('periode') && $request->periode) {
            $now = \Carbon\Carbon::now();
            switch ($request->periode) {
                case '7j': $query->where('created_at', '>=', $now->copy()->subDays(7)); break;
                case '15j': $query->where('created_at', '>=', $now->copy()->subDays(15)); break;
                case '30j': $query->where('created_at', '>=', $now->copy()->subDays(30)); break;
                case '60j': $query->where('created_at', '>=', $now->copy()->subDays(60)); break;
                case 'plus_1an': $query->where('created_at', '<', $now->copy()->subYear()); break;
            }
        }

        if ($request->has('search') && $request->search) {
            $query->where('message', 'like', '%' . $request->search . '%');
        }

        return $query->orderBy('created_at', 'desc')->paginate(10);
    });
    Route::patch('/notifications/{id}/lu', function (int $id) {
        \App\Models\Notification::where('id', $id)
            ->where('destinataire_id', Auth::id())
            ->update(['lu' => true]);
        return response()->json(['success' => true]);
    });
    Route::post('/notifications/tout-lu', function () {
        \App\Models\Notification::where('destinataire_id', Auth::id())
            ->where('lu', false)
            ->update(['lu' => true]);
        return response()->json(['success' => true]);
    });

    // --- ROUTES DU RESPONSABLE (Rôle 2) ET ADMIN (Rôle 4) ---
    Route::middleware('role:2,4')->group(function () {
        Route::post('/taches', [TacheController::class, 'store']);
        Route::patch('/taches/{id}/valider', [TacheController::class, 'validerTerminaison']);
        Route::patch('/taches/{id}/annuler', [TacheController::class, 'annulerTerminaison']);
        
        // --- ROUTE DE CONFIGURATION DES CONGÉS ANNUELS ---
        Route::patch('/manager/employes/{id}/config-conges', [CongeController::class, 'configurerEmploye']);
    });

    // --- ROUTE DE LECTURE POUR LE RESPONSABLE ET L'ADMIN (CORRIGÉE) ---
    Route::get('/employes', function () {
        return \App\Models\User::where('role_id', 1)->get(['id', 'nom', 'prenom', 'fonction', 'solde_conge', 'periode_conges_annuels']);
    });

    // --- ACCÈS RÉSERVÉS UNIQUEMENT À L'ADMINISTRATEUR (Rôle 4) ---
    Route::middleware('role:4')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'index']);
        Route::post('/admin/users', [AdminController::class, 'store']);
        Route::patch('/admin/users/{id}/role', [AdminController::class, 'modifierRole']);
        Route::get('/admin/audit/export', [AdminController::class, 'exporterAudit']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'destroy']);
    });
});