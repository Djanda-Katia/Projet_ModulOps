<?php

namespace App\Http\Controllers;

use App\Models\AffectationTache;
use App\Models\DemandeConge;
use App\Models\Tache;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function getDashboard()
    {
        $user = Auth::user();

        // ---------------------------------------------------------------
        // 1. DASHBOARD RESPONSABLE
        // CDC 4.6 : Vue d'ensemble sur les congés et les tâches de l'équipe
        // ---------------------------------------------------------------
        if ($user->role_id === 2) {

            // Congés en attente avec détail de chaque demande
            $congesEnAttente = DemandeConge::with('user')
                ->where('statut', 'En attente')
                ->orderBy('created_at', 'desc')
                ->get();

            // Suivi de l'équipe (employés uniquement, rôle 1)
            $equipe = User::where('role_id', 1)->get()->map(function ($employe) {

                // Tâches de l'employé via la table pivot
                $tachesIds = AffectationTache::where('utilisateur_id', $employe->id)
                    ->pluck('tache_id');

                $taches = Tache::whereIn('id', $tachesIds)->get();

                // Jours de congés approuvés
                $congesApprouves = DemandeConge::where('user_id', $employe->id)
                    ->where('statut', 'Approuvée')
                    ->get();

                $joursPris = $congesApprouves->sum(
                    fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1
                );

                return [
                    'id'               => $employe->id,
                    'nom'              => $employe->nom,
                    'prenom'           => $employe->prenom,
                    'fonction'         => $employe->fonction,
                    'solde_conge'      => $employe->solde_conge,
                    'jours_conges_pris' => $joursPris,
                    'taches_stats'     => [
                        'a_faire'   => $taches->where('statut', 'À faire')->count(),
                        'en_cours'  => $taches->where('statut', 'En cours')->count(),
                        'terminees' => $taches->whereIn('statut', ['Terminée', 'Fermée'])->count(),
                    ],
                    // Liste complète des tâches de l'employé
                    'taches'           => $taches->values(),
                ];
            });

            return response()->json([
                'type'                   => 'responsable',
                'nb_conges_en_attente'   => $congesEnAttente->count(),
                // Liste des demandes de congés en attente avec détail
                'conges_en_attente'      => $congesEnAttente,
                // Suivi complet de l'équipe
                'suivi_equipe'           => $equipe,
            ]);
        }

        // ---------------------------------------------------------------
        // 2. DASHBOARD TECHNICIEN
        // CDC 4.6 : Vue d'ensemble sur ses tickets et leurs statuts
        // ---------------------------------------------------------------
        if ($user->role_id === 3) {

            $tickets = Ticket::where('technicien_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'type'       => 'technicien',
                // Statistiques rapides
                'stats' => [
                    'total'    => $tickets->count(),
                    'ouverts'  => $tickets->where('statut', 'Ouvert')->count(),
                    'en_cours' => $tickets->where('statut', 'En cours')->count(),
                    'resolus'  => $tickets->where('statut', 'Résolu')->count(),
                    'fermes'   => $tickets->where('statut', 'Fermé')->count(),
                ],
                // Liste complète des tickets assignés au technicien
                'tickets'    => $tickets,
            ]);
        }

        // ---------------------------------------------------------------
        // 3. DASHBOARD EMPLOYÉ
        // CDC 4.6 : Statut de ses demandes de congés, ses tickets, ses tâches
        // ---------------------------------------------------------------

        // Demandes de congé avec tous les statuts
        $conges = DemandeConge::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Tickets soumis par l'employé
        $tickets = Ticket::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Tâches assignées via la table pivot
        $tachesIds = AffectationTache::where('utilisateur_id', $user->id)
            ->pluck('tache_id');

        $taches = Tache::whereIn('id', $tachesIds)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calcul des jours de congés déjà pris
        $joursPris = $conges->where('statut', 'Approuvée')->sum(
            fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1
        );

        return response()->json([
            'type'          => 'employe',
            // Résumé chiffré
            'stats' => [
                'solde_conge'      => $user->solde_conge,
                'jours_conges_pris' => $joursPris,
                'solde_restant'    => $user->solde_conge - $joursPris,
                'tickets_ouverts'  => $tickets->where('statut', 'Ouvert')->count(),
                'taches_en_cours'  => $taches->where('statut', 'En cours')->count(),
            ],
            // Listes complètes pour affichage dans l'interface
            'conges'        => $conges,
            'tickets'       => $tickets,
            'taches'        => $taches,
        ]);
    }
}