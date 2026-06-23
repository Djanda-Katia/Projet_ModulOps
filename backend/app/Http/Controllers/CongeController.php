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
        $dateDebut  = new \DateTime($request->date_debut);

        if ($dateDebut < $aujourdhui) {
            return response()->json([
                'message' => "❌ Demande refusée. Le {$request->date_debut} est une date passée. Aujourd'hui nous sommes le " . $aujourdhui->format('d/m/Y') . ". Veuillez choisir une date à partir d'aujourd'hui ou une date future."
            ], 422);
        }

        $debut         = new \DateTime($request->date_debut);
        $fin           = new \DateTime($request->date_fin);
        $joursDemandes = $debut->diff($fin)->days + 1;

        $soldeRestant = $user->solde_conge ?? 30;

        if ($joursDemandes > $soldeRestant) {
            return response()->json([
                'message' => "Solde insuffisant. Vous demandez {$joursDemandes} jours alors qu'il ne vous reste que {$soldeRestant} jours."
            ], 422);
        }

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
                $nouveauSolde = $employe->solde_conge - $joursDemandes;
                if ($nouveauSolde < 0) {
                    return response()->json(['message' => 'Le solde deviendrait négatif.'], 422);
                }
                $employe->solde_conge = $nouveauSolde;
                $employe->save();
            }
        }

        $conge->update([
            'statut' => $request->statut,
            'motif'  => $request->motif
        ]);

        $messageNotif = ($request->statut === 'Rejetée')
            ? "Votre demande de congé a été rejetée. Motif : {$request->motif}"
            : "Votre demande de congé a été approuvée ! ({$joursDemandes} jours déduits)";

        Notification::create([
            'destinataire_id' => $conge->user_id,
            'type'            => 'conge_decision',
            'message'         => $messageNotif,
            'lu'              => false
        ]);

        $responsable = Auth::user();
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

        $this->logAudit("Configuration des congés annuels mise à jour pour {$employe->nom} {$employe->prenom} par {$user->nom} {$user->prenom}.");

        return response()->json([
            'message' => 'Configuration des congés enregistrée avec succès',
            'solde_conge' => $employe->solde_conge,
            'periode_conges_annuels' => $employe->periode_conges_annuels,
        ]);
    }
}