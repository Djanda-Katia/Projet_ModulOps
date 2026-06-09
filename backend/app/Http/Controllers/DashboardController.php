<?php

namespace App\Http\Controllers;

use App\Models\DemandeConge;
use App\Models\Tache;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Retourne uniquement des statistiques en lecture seule.
     * Aucune action (update/delete) n'est autorisée ici.
     */
    public function getDashboard()
    {
        $user = Auth::user();

        // 1. DASHBOARD RESPONSABLE : Vue d'ensemble RH et Tâches de l'équipe
        if ($user->role_id === 2) {
            return response()->json([
                'type' => 'responsable',
                'vue_ensemble' => [
                    'charge_conges_attente' => DemandeConge::where('statut', 'En attente')->count(),
                    'suivi_equipe' => User::where('role_id', '!=', 2)->get()->map(function ($e) {
                        return [
                            // CORRECTION : Remplacement de ->name par l'identité réelle (nom et prenom)
                            'nom' => $e->nom,
                            'prenom' => $e->prenom,
                            'jours_conges_pris' => DemandeConge::where('user_id', $e->id)->where('statut', 'Approuvée')->get()
                                ->sum(fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1),
                            'taches' => [
                                'a_faire' => Tache::where('user_id', $e->id)->where('statut', 'À faire')->count(),
                                'en_cours' => Tache::where('user_id', $e->id)->where('statut', 'En cours')->count(),
                                // CORRECTION : On compte à la fois les tâches achevées et celles validées (Fermée)
                                'terminees' => Tache::where('user_id', $e->id)->whereIn('statut', ['Terminée', 'Fermée'])->count(),
                            ]
                        ];
                    })
                ]
            ]);
        }

        // 2. DASHBOARD TECHNICIEN : Statistiques opérationnelles
        if ($user->role_id === 3) {
            return response()->json([
                'type' => 'technicien',
                'statistiques' => [
                    'tickets_assignes' => Ticket::where('technicien_id', $user->id)->count(),
                    'tickets_en_cours' => Ticket::where('technicien_id', $user->id)->where('statut', 'En cours')->count(),
                    'taches_en_cours' => Tache::where('user_id', $user->id)->where('statut', 'En cours')->count(),
                    // CORRECTION : Prise en compte du statut finalisé pour les tâches
                    'taches_terminees' => Tache::where('user_id', $user->id)->whereIn('statut', ['Terminée', 'Fermée'])->count(),
                ]
            ]);
        }

        // 3. DASHBOARD EMPLOYÉ : Statistiques personnelles
        return response()->json([
            'type' => 'employe',
            'statistiques' => [
                'conges_pris' => DemandeConge::where('user_id', $user->id)->where('statut', 'Approuvée')->get()
                    ->sum(fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1),
                // CORRECTION : On utilise la colonne réelle solde_conge de ta base de données !
                'solde_restant' => $user->solde_conge,
                'taches_en_cours' => Tache::where('user_id', $user->id)->where('statut', 'En cours')->count(),
                'tickets_ouverts' => Ticket::where('user_id', $user->id)->where('statut', 'Ouvert')->count(),
            ]
        ]);
    }
}