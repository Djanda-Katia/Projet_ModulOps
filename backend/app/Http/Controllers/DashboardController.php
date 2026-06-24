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
                    'id'                      => $employe->id,
                    'nom'                     => $employe->nom,
                    'prenom'                  => $employe->prenom,
                    'fonction'                => $employe->fonction,
                    'solde_conge'             => $employe->solde_conge,
                    'periode_conges_annuels'  => is_array($employe->periode_conges_annuels) ? $employe->periode_conges_annuels : [],
                    'jours_conges_pris'       => $joursPris,
                    'taches_stats'            => [
                        'a_faire'   => $taches->where('statut', 'À faire')->count(),
                        'en_cours'  => $taches->where('statut', 'En cours')->count(),
                        'terminees' => $taches->whereIn('statut', ['Terminée', 'Fermée'])->count(),
                    ],
                    'taches'                  => $taches->values(),
                ];
            });

            // Signalements de congés non configurés (non lus)
            $signalements = \App\Models\Notification::where('destinataire_id', $user->id)
                ->where('type', 'signalement_conge_non_configure')
                ->where('lu', false)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'type'                   => 'responsable',
                'nb_conges_en_attente'   => $congesEnAttente->count(),
                'conges_en_attente'      => $congesEnAttente,
                'suivi_equipe'           => $equipe,
                'signalements_non_lus'   => $signalements,
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

        $conges = DemandeConge::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $tickets = Ticket::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $tachesIds = AffectationTache::where('utilisateur_id', $user->id)
            ->pluck('tache_id');

        $taches = Tache::whereIn('id', $tachesIds)
            ->orderBy('created_at', 'desc')
            ->get();

        // --- SOLDE ANNUEL DYNAMIQUE ---
        // Total des jours dans les périodes configurées par le responsable
        $periodes = is_array($user->periode_conges_annuels) ? $user->periode_conges_annuels : [];
        $soldeTotalAnnuel = 0;
        foreach ($periodes as $periode) {
            $d = new \DateTime($periode['start']);
            $f = new \DateTime($periode['end']);
            $soldeTotalAnnuel += $d->diff($f)->days + 1;
        }

        // Jours de congés ANNUELS approuvés seulement
        $joursAnnuelsPris = $conges
            ->where('statut', 'Approuvée')
            ->where('type_conge', 'Annuel')
            ->sum(fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1);

        $soldeAnnuelRestant = max(0, $soldeTotalAnnuel - $joursAnnuelsPris);

        // Tous types confondus pour info
        $joursTotalPris = $conges->where('statut', 'Approuvée')->sum(
            fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1
        );

        // --- CONGÉS MALADIE / EXCEPTIONNELS ACTIFS (compte à rebours) ---
        $aujourdhui = new \DateTime('now', new \DateTimeZone('Africa/Douala'));
        $aujourdhui->setTime(0, 0, 0);
        $todayStr = $aujourdhui->format('Y-m-d');

        $congesActifs = [];
        foreach (['Maladie', 'Exceptionnel'] as $type) {
            // Trouver le congé approuvé de ce type dont la fin n'est pas encore passée
            $actif = $conges
                ->where('statut', 'Approuvée')
                ->where('type_conge', $type)
                ->filter(fn($c) => $c->date_fin >= $todayStr)
                ->sortBy('date_debut')
                ->first();

            if ($actif) {
                $fin = new \DateTime($actif->date_fin);
                // Jours restants = jours APRÈS aujourd'hui dans cette période
                $joursRestants = (int) $aujourdhui->diff($fin)->days;
                $congesActifs[$type] = [
                    'actif'          => true,
                    'jours_restants' => $joursRestants,
                    'date_debut'     => $actif->date_debut,
                    'date_fin'       => $actif->date_fin,
                ];
            } else {
                $congesActifs[$type] = ['actif' => false, 'jours_restants' => 0];
            }
        }

        return response()->json([
            'type'    => 'employe',
            'stats'   => [
                'solde_annuel_total'   => $soldeTotalAnnuel,
                'solde_annuel_restant' => $soldeAnnuelRestant,
                'jours_annuels_pris'   => $joursAnnuelsPris,
                'jours_conges_pris'    => $joursTotalPris,
                'tickets_ouverts'      => $tickets->where('statut', 'Ouvert')->count(),
                'taches_en_cours'      => $taches->where('statut', 'En cours')->count(),
            ],
            'conges_actifs'           => $congesActifs,
            'periode_conges_annuels'  => $periodes,
            'conges'                  => $conges,
            'tickets'                 => $tickets,
            'taches'                  => $taches,
        ]);
    }
}