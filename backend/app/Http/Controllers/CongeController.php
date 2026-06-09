<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DemandeConge; // Correction : On utilise le bon modèle qui pointe sur demandes_conge
use App\Models\Notification;
use App\Models\User; // Ajouté pour pouvoir notifier les responsables
use Illuminate\Support\Facades\Auth;

class CongeController extends Controller
{
    /**
     * Liste des congés (Point 4.3 - Historique)
     */
    public function index()
    {
        // Strictement conforme au cahier des charges : 
        // Seul le Responsable (rôle 2) voit tout l'historique des congés. 
        // L'Admin (rôle 4) n'a plus accès. L'employé voit ses propres congés.
        if (Auth::user()->role_id === 2) {
            return DemandeConge::with('user')->orderBy('created_at', 'desc')->get();
        }
        
        return DemandeConge::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
    }

    /**
     * Soumission d'une demande par l'employé
     */
    public function soumettreDemande(Request $request)
    {
        $request->validate([
            'type_conge' => 'required|string', // Aligné avec la migration (type_conge)
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'motif' => 'nullable|string' // Aligné avec la migration (motif au lieu de commentaire)
        ]);

        $user = Auth::user();

        // 1. Calculer le nombre de jours demandés (inclusif)
        $debut = new \DateTime($request->date_debut);
        $fin = new \DateTime($request->date_fin);
        $joursDemandes = $debut->diff($fin)->days + 1;

        // 2. Calculer les jours déjà pris et approuvés
        $joursPris = DemandeConge::where('user_id', $user->id)
            ->where('statut', 'Approuvée')
            ->get()
            ->sum(function($c) {
                return (new \DateTime($c->date_debut))->diff(new \DateTime($c->date_fin))->days + 1;
            });

        // 3. Calculer le solde restant réel basé sur son solde_conge (30 jours par défaut)
        $soldeRestant = ($user->solde_conge ?? 30) - $joursPris;

        // 4. Vérification du solde de sécurité
        if ($joursDemandes > $soldeRestant) {
            return response()->json([
                'message' => "Solde insuffisant. Vous demandez {$joursDemandes} jours alors qu'il ne vous reste que {$soldeRestant} jours."
            ], 422);
        }

        // 5. Création de la demande si le solde est OK
        $conge = DemandeConge::create([
            'user_id' => $user->id,
            'type_conge' => $request->type_conge,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'statut' => 'En attente', // Aligné avec la migration (statut)
            'motif' => $request->motif
        ]);

        // 6. Notification automatique à TOUS les responsables (role_id = 2) (Point 4.7)
        $responsables = User::where('role_id', 2)->get();
        foreach ($responsables as $responsable) {
            Notification::create([
                'destinataire_id' => $responsable->id,
                'type' => 'conge_soumis',
                'message' => "Nouvelle demande de congé soumise par {$user->nom} {$user->prenom} ({$joursDemandes} jours).",
                'lu' => false
            ]);
        }

        return response()->json(['message' => 'Demande envoyée avec succès', 'data' => $conge], 201);
    }

    /**
     * Décision du responsable (Acceptation/Refus avec motif)
     */
    public function decider(Request $request, int $id)
    {
        // Sécurité stricte cahier des charges : Seul le Responsable (rôle 2) peut décider
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée. Seul le responsable gère les congés.'], 403);
        }

        $request->validate([
            'statut' => 'required|in:Approuvée,Rejetée', // Aligné avec la migration
            // Si c'est Rejetée ou Approuvée, on utilise le champ 'motif' présent dans ta migration
            'motif' => 'required_if:statut,Rejetée|string|nullable'
        ]);

        $conge = DemandeConge::findOrFail($id);

        $conge->update([
            'statut' => $request->statut,
            'motif' => $request->motif
        ]);

        // Envoi de la notification à l'employé
        $messageNotif = ($request->statut === 'Rejetée') 
            ? "Votre demande de congé a été rejetée. Motif : " . $request->motif
            : "Votre demande de congé a été approuvée !";

        Notification::create([
            'destinataire_id' => $conge->user_id,
            'type' => 'conge_decision',
            'message' => $messageNotif,
            'lu' => false
        ]);

        return response()->json([
            'success' => true,
            'message' => "La demande a été " . strtolower($request->statut)
        ]);
    }
}