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
     * Responsable (rôle 2) voit tout, l'employé voit ses propres congés
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

        // 1. Calculer le nombre de jours demandés (inclusif)
        $debut         = new \DateTime($request->date_debut);
        $fin           = new \DateTime($request->date_fin);
        $joursDemandes = $debut->diff($fin)->days + 1;

        // 2. Calculer les jours déjà pris et approuvés (déjà déduits du solde)
        $joursPris = DemandeConge::where('user_id', $user->id)
            ->where('statut', 'Approuvée')
            ->get()
            ->sum(fn($c) => (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1);

        // 3. Solde restant réel (basé sur le solde actuel de l'utilisateur)
        // Le solde de l'utilisateur est déjà diminué des congés approuvés précédemment.
        // On recalcule le solde restant en prenant le solde actuel (déjà déduit) moins les jours déjà pris ?
        // Non : le solde actuel est le solde initial moins les jours approuvés.
        // Il suffit donc de comparer joursDemandes avec soldeRestant = solde_conge actuel.
        // Attention : si le solde_conge n'a jamais été mis à jour, il faut utiliser la logique ci-dessous.
        // Pour être cohérent, on prend le solde_conge de l'utilisateur qui représente son solde restant réel.
        $soldeRestant = $user->solde_conge ?? 30;

        // 4. Vérification du solde
        if ($joursDemandes > $soldeRestant) {
            return response()->json([
                'message' => "Solde insuffisant. Vous demandez {$joursDemandes} jours alors qu'il ne vous reste que {$soldeRestant} jours."
            ], 422);
        }

        // 5. Création de la demande
        $conge = DemandeConge::create([
            'user_id'    => $user->id,
            'type_conge' => $request->type_conge,
            'date_debut' => $request->date_debut,
            'date_fin'   => $request->date_fin,
            'statut'     => 'En attente',
            'motif'      => $request->motif
        ]);

        // 6. Notification à tous les responsables
        $responsables = User::where('role_id', 2)->get();
        foreach ($responsables as $responsable) {
            Notification::create([
                'destinataire_id' => $responsable->id,
                'type'            => 'conge_soumis',
                'message'         => "Nouvelle demande de congé soumise par {$user->nom} {$user->prenom} ({$joursDemandes} jours).",
                'lu'              => false
            ]);
        }

        // AUDIT
        $this->logAudit("Soumission d'une demande de congé par {$user->nom} {$user->prenom} : {$request->type_conge} du {$request->date_debut} au {$request->date_fin} ({$joursDemandes} jours).");

        return response()->json(['message' => 'Demande envoyée avec succès', 'data' => $conge], 201);
    }

    /**
     * Décision du responsable (Approbation ou Rejet)
     * CORRECTION : mise à jour du solde de congés lors de l'approbation
     */
    public function decider(Request $request, int $id)
    {
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée. Seul le responsable gère les congés.'], 403);
        }

        $request->validate([
            'statut' => 'required|in:Approuvée,Rejetée',
            'motif'  => 'required_if:statut,Rejetée|string|nullable'
        ]);

        $conge = DemandeConge::with('user')->findOrFail($id);
        $employe = $conge->user;

        // Calcul des jours de la demande
        $debut = new \DateTime($conge->date_debut);
        $fin   = new \DateTime($conge->date_fin);
        $joursDemandes = $debut->diff($fin)->days + 1;

        // Si approbation, déduire les jours du solde de l'employé (sauf si déjà fait)
        if ($request->statut === 'Approuvée') {
            // Vérifier que la demande n'a pas déjà été approuvée auparavant (éviter double déduction)
            if ($conge->statut !== 'Approuvée') {
                $nouveauSolde = $employe->solde_conge - $joursDemandes;
                if ($nouveauSolde < 0) {
                    return response()->json(['message' => 'Le solde deviendrait négatif, annulation.'], 422);
                }
                $employe->solde_conge = $nouveauSolde;
                $employe->save();
            }
        }

        // Mise à jour du statut et du motif
        $conge->update([
            'statut' => $request->statut,
            'motif'  => $request->motif
        ]);

        // Notification à l'employé
        $messageNotif = ($request->statut === 'Rejetée')
            ? "Votre demande de congé a été rejetée. Motif : {$request->motif}"
            : "Votre demande de congé a été approuvée ! ({$joursDemandes} jours déduits de votre solde)";

        Notification::create([
            'destinataire_id' => $conge->user_id,
            'type'            => 'conge_decision',
            'message'         => $messageNotif,
            'lu'              => false
        ]);

        // AUDIT
        $responsable = Auth::user();
        $this->logAudit("Décision sur demande de congé de {$employe->nom} {$employe->prenom} : {$request->statut} par {$responsable->nom} {$responsable->prenom}.");

        return response()->json([
            'success' => true,
            'message' => "La demande a été " . strtolower($request->statut)
        ]);
    }
}