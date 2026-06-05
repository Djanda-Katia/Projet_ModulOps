<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DemandeConge; // Utilise ton modèle d'action
use App\Models\Conge;        // Utilise ton modèle de base
use App\Models\Ticket;
use App\Models\Tache;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        $user = Auth::user();
        
        // 1. Indicateurs des Congés (Point 4.6.2)
        $statsConges = [
            // On compte les demandes en attente dans DemandeConge [cite: 129]
            'en_attente' => DemandeConge::where('statut', 'En attente')->count(),
            // On récupère le solde mis à jour dans la table users ou via Conge [cite: 128]
            'mon_solde' => $user->solde_conge ?? 30,
        ];

        // 2. Indicateurs des Tickets (Point 4.6.3) [cite: 130, 132]
        $statsTickets = [
            'ouverts' => Ticket::where('statut', 'Ouvert')->count(),
            'en_cours' => Ticket::where('statut', 'En cours')->count(),
            'resolus' => Ticket::where('statut', 'Résolu')->count(),
            'priorite_haute' => Ticket::where('priorite', 'Haute')->count(),
        ];

        // 3. Indicateurs des Tâches (Point 4.6.3) [cite: 131]
        $statsTaches = [
            'en_retard' => Tache::where('statut', '!=', 'Terminée')
                ->where('date_echeance', '<', Carbon::now())
                ->count(),
        ];

        return response()->json([
            'user_role' => $user->role_id,
            'conges' => $statsConges,
            'tickets' => $statsTickets,
            'taches' => $statsTaches
        ]);
    }
}