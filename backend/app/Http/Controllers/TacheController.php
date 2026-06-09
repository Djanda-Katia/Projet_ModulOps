<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tache;
use App\Models\AffectationTache; // Gère l'assignation multiple
use App\Models\Notification;     // Gère les alertes cloche
use Illuminate\Support\Facades\Auth;

class TacheController extends Controller
{
    /**
     * Action métier : Création et assignation multiple par le responsable
     * NOTE : Les champs 'priorite' et 'date_echeance' ont été totalement supprimés ici.
     */
    public function store(Request $request)
    {
        // Seul le Responsable (rôle 2) peut créer et affecter des tâches
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée. Seul un responsable gère les tâches.'], 403);
        }

        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'employes_ids' => 'required|array', // Reçoit un tableau d'identifiants [1, 2, 3]
            'employes_ids.*' => 'exists:users,id'
        ]);

        // Liaison de la tâche au premier employé pour respecter la structure SQL
        $premierEmployeId = $request->employes_ids[0];

        // 1. Création de la tâche principale (sans priorité ni échéance)
        $tache = Tache::create([
            'user_id' => $premierEmployeId,
            'assigne_par' => Auth::id(),
            'titre' => $request->titre,
            'description' => $request->description,
            'statut' => 'À faire'
        ]);

        // 2. Traitement de l'assignation multiple via la table pivot
        foreach ($request->employes_ids as $employeId) {
            
            AffectationTache::create([
                'tache_id' => $tache->id,
                'utilisateur_id' => $employeId,
                'assigne_par' => Auth::id()
            ]);

            // 3. Notification interne à chaque employé concerné (Point 4.7)
            Notification::create([
                'destinataire_id' => $employeId,
                'type' => 'tache_assignee',
                'message' => "Une nouvelle tâche vous a été assignée par le responsable : '{$tache->titre}'.",
                'lu' => false
            ]);
        }

        return response()->json([
            'message' => 'Tâche créée et assignée avec succès à l\'équipe.',
            'data' => $tache
        ], 201);
    }

    // L'employé modifie son statut (À faire -> En cours -> Terminée)
    public function updateStatut(Request $request, int $id)
    {
        $request->validate(['statut' => 'required|in:À faire,En cours,Terminée']);
        
        // On s'assure que la tâche appartient bien à l'employé connecté
        $tache = Tache::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $tache->update(['statut' => $request->statut]);

        return response()->json(['message' => 'Statut de la tâche mis à jour.']);
    }

    /**
     * Action métier : Le responsable confirme et clôture la tâche (Terminée -> Fermée)
     */
    public function validerTerminaison(Request $request, int $id)
    {
        // Sécurité : Seul le responsable (rôle 2) clôture définitivement
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $tache = Tache::findOrFail($id);
        
        if ($tache->statut !== 'Terminée') {
            return response()->json(['message' => 'Impossible de fermer une tâche qui n\'a pas encore été mise à l\'état Terminée par l\'employé.'], 422);
        }

        // Passage à l'état final validé
        $tache->update(['statut' => 'Fermée']);

        return response()->json(['message' => 'La tâche a été validée et clôturée avec succès par le responsable.']);
    }

    // Récupérer la liste des tâches de l'employé connecté
    public function mesTaches()
    {
        return Tache::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
    }
}