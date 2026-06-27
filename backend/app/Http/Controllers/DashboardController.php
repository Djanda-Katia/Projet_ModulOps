<?php

namespace App\Http\Controllers;

use App\Models\AffectationTache;
use App\Models\DemandeConge;
use App\Models\Tache;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function getDashboard(Request $request)
    {
        $user = Auth::user();

        // ---------------------------------------------------------------
        // 1. DASHBOARD RESPONSABLE
        // CDC 4.6 : Vue d'ensemble sur les congés et les tâches de l'équipe
        // ---------------------------------------------------------------
        if ($user->role_id === 2) {

            // Congés en attente avec détail de chaque demande
            $congesQuery = DemandeConge::with('user')->where('statut', 'En attente');
            if ($request->has('dates') && $request->dates) {
                $datesArray = explode(',', $request->dates);
                if (count($datesArray) === 2) {
                    $congesQuery->whereBetween('created_at', [$datesArray[0].' 00:00:00', $datesArray[1].' 23:59:59']);
                }
            }
            $congesEnAttente = $congesQuery->orderBy('created_at', 'desc')->get();

            // Suivi de l'équipe (employés uniquement, rôle 1) — requêtes bulk pour éviter N+1
            $employes = User::where('role_id', 1)->get();
            $employeIds = $employes->pluck('id');

            // Toutes les affectations de tâches pour l'équipe en une seule requête
            $toutesAffectations = AffectationTache::whereIn('utilisateur_id', $employeIds)->get();
            $tacheIdsParEmploye = $toutesAffectations->groupBy('utilisateur_id');

            // Toutes les tâches de l'équipe en une seule requête
            $tousLesTacheIds = $toutesAffectations->pluck('tache_id')->unique();
            $tachesQuery = Tache::whereIn('id', $tousLesTacheIds);
            if ($request->has('dates') && $request->dates) {
                $datesArray = explode(',', $request->dates);
                if (count($datesArray) === 2) {
                    $tachesQuery->whereBetween('created_at', [$datesArray[0].' 00:00:00', $datesArray[1].' 23:59:59']);
                }
            }
            $toutesTaches = $tachesQuery->get()->keyBy('id');

            // Tous les congés approuvés de l'équipe en une seule requête
            $tousCongesApprouves = DemandeConge::whereIn('user_id', $employeIds)
                ->where('statut', 'Approuvée')->get()->groupBy('user_id');

            $equipe = $employes->map(function ($employe) use ($tacheIdsParEmploye, $toutesTaches, $tousCongesApprouves) {
                $affectationsEmploye = $tacheIdsParEmploye->get($employe->id, collect());
                $tachesEmploye = $affectationsEmploye->map(fn($a) => $toutesTaches->get($a->tache_id))->filter();

                $congesEmploye = $tousCongesApprouves->get($employe->id, collect());
                $joursPris = $congesEmploye->sum(
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
                        'a_faire'   => $tachesEmploye->where('statut', 'À faire')->count(),
                        'en_cours'  => $tachesEmploye->where('statut', 'En cours')->count(),
                        'terminees' => $tachesEmploye->whereIn('statut', ['Terminée', 'Fermée'])->count(),
                    ],
                    'taches'                  => $tachesEmploye->values(),
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

            $ticketsQuery = Ticket::where('technicien_id', $user->id);
            if ($request->has('dates') && $request->dates) {
                $datesArray = explode(',', $request->dates);
                if (count($datesArray) === 2) {
                    $ticketsQuery->whereBetween('created_at', [$datesArray[0].' 00:00:00', $datesArray[1].' 23:59:59']);
                }
            }
            $tickets = $ticketsQuery->orderBy('created_at', 'desc')->get();

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

        $congesQuery = DemandeConge::where('user_id', $user->id);
        $ticketsQuery = Ticket::where('user_id', $user->id);
        
        $tachesIds = AffectationTache::where('utilisateur_id', $user->id)->pluck('tache_id');
        $tachesQuery = Tache::whereIn('id', $tachesIds);

        if ($request->has('dates') && $request->dates) {
            $datesArray = explode(',', $request->dates);
            if (count($datesArray) === 2) {
                $congesQuery->whereBetween('created_at', [$datesArray[0].' 00:00:00', $datesArray[1].' 23:59:59']);
                $ticketsQuery->whereBetween('created_at', [$datesArray[0].' 00:00:00', $datesArray[1].' 23:59:59']);
                $tachesQuery->whereBetween('created_at', [$datesArray[0].' 00:00:00', $datesArray[1].' 23:59:59']);
            }
        }

        $conges = $congesQuery->orderBy('created_at', 'desc')->get();
        $tickets = $ticketsQuery->orderBy('created_at', 'desc')->get();
        $taches = $tachesQuery->orderBy('created_at', 'desc')->get();



        // --- SOLDE ANNUEL DYNAMIQUE ---
        // Total des jours dans les périodes configurées par le responsable
        $periodes = is_array($user->periode_conges_annuels) ? $user->periode_conges_annuels : [];
        $soldeTotalAnnuel = 0;
        foreach ($periodes as $periode) {
            $d = new \DateTime($periode['start']);
            $f = new \DateTime($periode['end']);
            $soldeTotalAnnuel += $d->diff($f)->days + 1;
        }

        // Requête non filtrée pour les comptes à rebours et soldes (doivent toujours être corrects)
        $congesNonFiltres = DemandeConge::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();

        // Jours de congés ANNUELS approuvés seulement (requête non-filtrée pour l'année entière)
        $joursAnnuelsPris = $congesNonFiltres
            ->where('statut', 'Approuvée')
            ->where('type_conge', 'Annuel')
            ->sum(fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1);

        $soldeAnnuelRestant = max(0, $soldeTotalAnnuel - $joursAnnuelsPris);

        // Tous types confondus pour info (sur la période filtrée)
        $joursTotalPris = $congesNonFiltres->where('statut', 'Approuvée')->sum(
            fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1
        );

        // --- CONGÉS MALADIE / EXCEPTIONNELS ACTIFS (compte à rebours) ---
        $aujourdhui = new \DateTime('now', new \DateTimeZone('Africa/Douala'));
        $aujourdhui->setTime(0, 0, 0);
        $todayStr = $aujourdhui->format('Y-m-d');

        $congesActifs = [];
        foreach (['Maladie', 'Exceptionnel'] as $type) {
            // Trouver le congé approuvé de ce type dont la fin n'est pas encore passée
            $actif = $congesNonFiltres
                ->where('statut', 'Approuvée')
                ->where('type_conge', $type)
                ->filter(fn($c) => $c->date_fin >= $todayStr)
                ->sortBy('date_debut')
                ->first();

            if ($actif) {
                $debut = new \DateTime($actif->date_debut);
                $debut->setTime(0, 0, 0);
                $fin   = new \DateTime($actif->date_fin);
                $fin->setTime(0, 0, 0);

                // Nombre TOTAL de jours du congé (fixé, ne change pas)
                $joursTotaux = $debut->diff($fin)->days + 1;

                // Le congé a-t-il déjà commencé ?
                $aCommence = ($aujourdhui >= $debut);

                if ($aCommence) {
                    // Jours restants = depuis aujourd'hui jusqu'à la fin, INCLUS (aujourd'hui compte pour 1)
                    // Exemple: aujourd'hui = 30/06, fin = 03/07 → diff = 3 jours + 1 = 4 restants ✓
                    // Exemple: aujourd'hui = 03/07 (dernier jour), fin = 03/07 → diff = 0 + 1 = 1 restant ✓
                    $joursRestants = $aujourdhui->diff($fin)->days + 1;
                } else {
                    // Le congé n'a pas encore commencé : afficher le nombre total de jours
                    $joursRestants = $joursTotaux;
                }

                $congesActifs[$type] = [
                    'actif'          => true,
                    'a_commence'     => $aCommence,
                    'jours_restants' => $joursRestants,
                    'jours_totaux'   => $joursTotaux,
                    'date_debut'     => $actif->date_debut,
                    'date_fin'       => $actif->date_fin,
                ];
            } else {
                $congesActifs[$type] = ['actif' => false, 'jours_restants' => 0];
            }
        }

        // --- COMPTE À REBOURS CONGÉS ANNUELS (prochain/en cours) ---
        $prochainCongeAnnuel = $congesNonFiltres
            ->where('statut', 'Approuvée')
            ->where('type_conge', 'Annuel')
            ->filter(fn($c) => $c->date_fin >= $todayStr)
            ->sortBy('date_debut')
            ->first();

        $congesActifs['Annuel'] = ['actif' => false, 'jours_restants' => 0];
        if ($prochainCongeAnnuel) {
            $debA = new \DateTime($prochainCongeAnnuel->date_debut);
            $debA->setTime(0, 0, 0);
            $finA = new \DateTime($prochainCongeAnnuel->date_fin);
            $finA->setTime(0, 0, 0);
            $joursTotauxA = $debA->diff($finA)->days + 1;
            $aCommenceA   = ($aujourdhui >= $debA);
            // +1 pour inclure le jour actuel dans le décompte
            $joursRestantsA = $aCommenceA ? ($aujourdhui->diff($finA)->days + 1) : $joursTotauxA;

            $congesActifs['Annuel'] = [
                'actif'          => true,
                'a_commence'     => $aCommenceA,
                'jours_restants' => $joursRestantsA,
                'jours_totaux'   => $joursTotauxA,
                'date_debut'     => $prochainCongeAnnuel->date_debut,
                'date_fin'       => $prochainCongeAnnuel->date_fin,
            ];
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