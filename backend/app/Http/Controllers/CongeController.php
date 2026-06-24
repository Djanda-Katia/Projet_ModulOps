<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DemandeConge;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Traits\LogsAudit;

class CongeController extends Controller
{
    use LogsAudit;

    /**
     * Liste des congés
     */
    public function index()
    {
        if (Auth::user()->role_id === 2) {
            return DemandeConge::with('user')->orderBy('created_at', 'desc')->get();
        }

        return DemandeConge::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
    }

    /**
     * Soumission d'une demande de congé par l'employé
     */
    public function soumettreDemande(Request $request)
    {
        $request->validate([
            'type_conge' => 'required|string',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'motif'      => 'nullable|string'
        ]);

        $user = Auth::user();

        // ==== VÉRIFICATION TEMPS RÉEL ====
        $aujourdhui = new \DateTime('now', new \DateTimeZone('Africa/Douala'));
        $aujourdhui->setTime(0, 0, 0);
        $dateDebut  = new \DateTime($request->date_debut);
        $dateDebut->setTime(0, 0, 0);

        if ($dateDebut < $aujourdhui) {
            return response()->json([
                'message' => "❌ Demande refusée. Le {$request->date_debut} est une date passée. Aujourd'hui nous sommes le " . $aujourdhui->format('d/m/Y') . ". Veuillez choisir une date à partir d'aujourd'hui ou une date future."
            ], 422);
        }

        $debut         = new \DateTime($request->date_debut);
        $fin           = new \DateTime($request->date_fin);
        $joursDemandes = $debut->diff($fin)->days + 1;

        // ==== VALIDATION SPÉCIFIQUE PAR TYPE ====
        if ($request->type_conge === 'Annuel') {
            // Vérifier que les dates sont dans les périodes autorisées
            $periodes = is_array($user->periode_conges_annuels) ? $user->periode_conges_annuels : [];

            if (empty($periodes)) {
                return response()->json([
                    'message' => 'Aucune période de congés annuels n\'a été configurée pour vous. Contactez votre responsable.'
                ], 422);
            }

            $dansUnePeriode = false;
            foreach ($periodes as $periode) {
                $pStart = new \DateTime($periode['start']);
                $pEnd   = new \DateTime($periode['end']);
                if ($debut >= $pStart && $fin <= $pEnd) {
                    $dansUnePeriode = true;
                    break;
                }
            }

            if (!$dansUnePeriode) {
                return response()->json([
                    'message' => 'Les dates demandées ne font pas partie des périodes de congés annuels autorisées par votre responsable.'
                ], 422);
            }

            // Vérifier le solde restant (annuel uniquement)
            $joursAnnuelsPris = DemandeConge::where('user_id', $user->id)
                ->where('statut', 'Approuvée')
                ->where('type_conge', 'Annuel')
                ->get()
                ->sum(fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1);

            $soldeTotalAnnuel = 0;
            foreach ($periodes as $periode) {
                $d = new \DateTime($periode['start']);
                $f = new \DateTime($periode['end']);
                $soldeTotalAnnuel += $d->diff($f)->days + 1;
            }
            $soldeRestant = max(0, $soldeTotalAnnuel - $joursAnnuelsPris);

            if ($joursDemandes > $soldeRestant) {
                return response()->json([
                    'message' => "Solde insuffisant. Vous demandez {$joursDemandes} jours alors qu'il ne vous reste que {$soldeRestant} jours annuels."
                ], 422);
            }
        }
        // Pour Maladie et Exceptionnel : pas de limite de solde, juste la date future

        $conge = DemandeConge::create([
            'user_id'    => $user->id,
            'type_conge' => $request->type_conge,
            'date_debut' => $request->date_debut,
            'date_fin'   => $request->date_fin,
            'statut'     => 'En attente',
            'motif'      => $request->motif
        ]);

        $responsables = User::where('role_id', 2)->get();
        foreach ($responsables as $responsable) {
            Notification::create([
                'destinataire_id' => $responsable->id,
                'type'            => 'conge_soumis',
                'message'         => "Nouvelle demande de congé soumise par {$user->nom} {$user->prenom} ({$joursDemandes} jours).",
                'lu'              => false
            ]);
        }

        $this->logAudit("Soumission d'une demande de congé par {$user->nom} {$user->prenom} : {$request->type_conge} du {$request->date_debut} au {$request->date_fin}.");

        return response()->json(['message' => 'Demande envoyée avec succès', 'data' => $conge], 201);
    }

    /**
     * Décision du responsable (Approbation ou Rejet)
     */
    public function decider(Request $request, int $id)
    {
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $request->validate([
            'statut' => 'required|in:Approuvée,Rejetée',
            'motif'  => 'required_if:statut,Rejetée|string|nullable'
        ]);

        $conge = DemandeConge::with('user')->findOrFail($id);
        $employe = $conge->user;

        $debut = new \DateTime($conge->date_debut);
        $fin   = new \DateTime($conge->date_fin);
        $joursDemandes = $debut->diff($fin)->days + 1;

        if ($request->statut === 'Approuvée') {
            if ($conge->statut !== 'Approuvée') {
                // On ne décrémente le solde que pour les congés ANNUELS
                if ($conge->type_conge === 'Annuel') {
                    $nouveauSolde = $employe->solde_conge - $joursDemandes;
                    if ($nouveauSolde < 0) {
                        return response()->json(['message' => 'Le solde deviendrait négatif.'], 422);
                    }
                    $employe->solde_conge = $nouveauSolde;
                    $employe->save();
                }
            }
        } elseif ($request->statut === 'Rejetée') {
            // Si c'était déjà approuvé et qu'on le rejette, on rembourse
            if ($conge->statut === 'Approuvée' && $conge->type_conge === 'Annuel') {
                $employe->solde_conge += $joursDemandes;
                $employe->save();
            }
        }

        $conge->update([
            'statut' => $request->statut,
            'motif'  => $request->motif
        ]);

        $responsable = Auth::user();
        $messageNotif = ($request->statut === 'Rejetée')
            ? "❌ Votre demande de congé a été rejetée par {$responsable->prenom} {$responsable->nom}. Motif : {$request->motif}"
            : "✅ Votre demande de congé a été approuvée par {$responsable->prenom} {$responsable->nom} ! ({$joursDemandes} jours déduits)";

        Notification::create([
            'destinataire_id' => $conge->user_id,
            'type'            => 'conge_decision',
            'message'         => $messageNotif,
            'lu'              => false
        ]);


        $this->logAudit("Décision sur demande de congé de {$employe->nom} {$employe->prenom} : {$request->statut} par {$responsable->nom} {$responsable->prenom}.");

        return response()->json([
            'success' => true,
            'message' => "La demande a été " . strtolower($request->statut)
        ]);
    }

    // ============================================================
    // MÉTHODE DE CONFIGURATION DES CONGÉS ANNUELS
    // ============================================================
    public function configurerEmploye(Request $request, int $id)
    {
        $user = Auth::user();
        if (!$user || ($user->role_id !== 2 && $user->role_id !== 4)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $request->validate([
            'periode_conges_annuels' => 'required|array|min:1',
            'periode_conges_annuels.*.start' => 'required|date',
            'periode_conges_annuels.*.end'   => 'required|date|after_or_equal:periode_conges_annuels.*.start',
        ]);

        $employe = User::findOrFail($id);

        // Date du jour côté serveur (Cameroun)
        $aujourdhui = new \DateTime('now', new \DateTimeZone('Africa/Douala'));
        $aujourdhui->setTime(0, 0, 0);

        $periodes = $request->periode_conges_annuels;

        if (!empty($periodes) && is_array($periodes)) {
            // Trie les périodes pour détecter les chevauchements
            usort($periodes, fn($a, $b) => strcmp($a['start'], $b['start']));

            $previousEnd = null;
            foreach ($periodes as $periode) {
                if (empty($periode['start']) || empty($periode['end'])) {
                    return response()->json(['message' => 'Chaque période doit avoir une date de début et une date de fin.'], 422);
                }

                $debut = new \DateTime($periode['start']);
                $fin   = new \DateTime($periode['end']);

                // 1. Pas de date dans le passé
                if ($debut < $aujourdhui) {
                    return response()->json([
                        'message' => "Période du {$debut->format('d/m/Y')} déjà passée (aujourd'hui : {$aujourdhui->format('d/m/Y')})."
                    ], 422);
                }

                // 2. Fin >= Début (déjà validé, mais double sécurité)
                if ($fin < $debut) {
                    return response()->json(['message' => 'La date de fin doit suivre la date de début.'], 422);
                }

                // 3. Pas de chevauchement
                if ($previousEnd !== null && $debut <= $previousEnd) {
                    return response()->json(['message' => 'Deux périodes ne peuvent pas se chevaucher.'], 422);
                }

                $previousEnd = $fin;
            }
        }

        // Calcul du solde total
        $soldeCalcule = 0;
        if (!empty($periodes) && is_array($periodes)) {
            foreach ($periodes as $periode) {
                $debut = new \DateTime($periode['start']);
                $fin   = new \DateTime($periode['end']);
                $jours = $debut->diff($fin)->days + 1;
                $soldeCalcule += $jours;
            }
        }

        $employe->update([
            'solde_conge' => $soldeCalcule,
            'periode_conges_annuels' => $periodes,
        ]);

        // Marquer comme lus les signalements associés à cet employé pour le(s) responsable(s)
        $motifRecherche = "⚠️ {$employe->prenom} {$employe->nom} signale%";
        Notification::where('type', 'signalement_conge_non_configure')
            ->where('message', 'like', $motifRecherche)
            ->where('lu', false)
            ->update(['lu' => true]);

        // Notifier l'employé que ses congés ont été configurés/modifiés
        Notification::create([
            'destinataire_id' => $employe->id,
            'type'            => 'conge_configure',
            'message'         => "📅 Vos périodes de congés annuels ont été configurées/mises à jour par votre responsable {$user->prenom} {$user->nom}.",
            'lu'              => false,
        ]);

        $this->logAudit("Configuration des congés annuels mise à jour pour {$employe->nom} {$employe->prenom} par {$user->nom} {$user->prenom}.");

        return response()->json([
            'message' => 'Configuration des congés enregistrée avec succès',
            'solde_conge' => $employe->solde_conge,
            'periode_conges_annuels' => $employe->periode_conges_annuels,
        ]);
    }

    /**
     * Signalement : l'employé informe le responsable que ses congés annuels
     * n'ont pas encore été configurés.
     */
    public function signalerNonConfigure()
    {
        $employe = Auth::user();

        // Vérifier que c'est bien un employé (rôle 1)
        if ($employe->role_id !== 1) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        // Vérifier qu'il n'est effectivement pas configuré
        $periodes = is_array($employe->periode_conges_annuels) ? $employe->periode_conges_annuels : [];
        if (!empty($periodes)) {
            return response()->json(['message' => 'Vos congés annuels sont déjà configurés.'], 422);
        }

        // Envoyer une notification à tous les responsables
        $responsables = User::where('role_id', 2)->get();
        foreach ($responsables as $responsable) {
            Notification::create([
                'destinataire_id' => $responsable->id,
                'type'            => 'signalement_conge_non_configure',
                'message'         => "⚠️ {$employe->prenom} {$employe->nom} signale que ses congés annuels n'ont pas encore été configurés.",
                'lu'              => false,
            ]);
        }

        $this->logAudit("Signalement de congés non configurés par {$employe->nom} {$employe->prenom}.");

        return response()->json([
            'message' => 'Votre signalement a bien été transmis à votre responsable.'
        ]);
    }

    /**
     * Annuler une demande de congé (par l'employé)
     */
    public function annulerDemande(int $id)
    {
        $conge = DemandeConge::findOrFail($id);
        
        // Seul le propriétaire peut annuler
        if (Auth::id() !== $conge->user_id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        if (!in_array($conge->statut, ['En attente', 'Approuvée'])) {
            return response()->json(['message' => 'Impossible d\'annuler cette demande.'], 422);
        }

        // Si la demande était déjà approuvée, on rembourse le solde
        if ($conge->statut === 'Approuvée' && $conge->type_conge === 'Annuel') {
            $debut = new \DateTime($conge->date_debut);
            $fin   = new \DateTime($conge->date_fin);
            $jours = $debut->diff($fin)->days + 1;

            $employe = $conge->user;
            $employe->solde_conge += $jours;
            $employe->save();
        }

        $conge->delete();

        $employe = Auth::user();
        $responsables = User::where('role_id', 2)->get();
        foreach ($responsables as $responsable) {
            Notification::create([
                'destinataire_id' => $responsable->id,
                'type'            => 'conge_annule',
                'message'         => "❌ {$employe->prenom} {$employe->nom} a annulé sa demande de congé {$conge->type_conge}.",
                'lu'              => false
            ]);
        }

        $this->logAudit("Annulation d'une demande de congé par {$employe->nom} {$employe->prenom}.");

        return response()->json(['message' => 'Demande annulée avec succès.']);
    }
}