<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tache;
use App\Models\AffectationTache;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Traits\LogsAudit;

class TacheController extends Controller
{
    use LogsAudit;

    /**
     * Création et assignation multiple par le responsable (aux employés uniquement)
     */
    public function store(Request $request)
    {
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée. Seul un responsable gère les tâches.'], 403);
        }

        $request->validate([
            'titre'          => 'required|string|max:255',
            'description'    => 'nullable|string',
            'employes_ids'   => 'required|array',
            'employes_ids.*' => 'exists:users,id'
        ]);

        // Vérification que tous les IDs fournis sont bien des employés (rôle 1)
        $employes = User::whereIn('id', $request->employes_ids)->get();
        foreach ($employes as $employe) {
            if ($employe->role_id !== 1) {
                return response()->json([
                    'message' => "L'utilisateur {$employe->nom} {$employe->prenom} n'est pas un employé. Les tâches ne peuvent être assignées qu'aux employés."
                ], 422);
            }
        }

        $premierEmployeId = $request->employes_ids[0];

        // Création de la tâche principale
        $tache = Tache::create([
            'user_id'     => $premierEmployeId,
            'assigne_par' => Auth::id(),
            'titre'       => $request->titre,
            'description' => $request->description,
            'statut'      => 'À faire'
        ]);

        // Assignation multiple via la table pivot + notifications
        foreach ($request->employes_ids as $employeId) {
            AffectationTache::create([
                'tache_id'       => $tache->id,
                'utilisateur_id' => $employeId,
            ]);

            $responsable = Auth::user();
            Notification::create([
                'destinataire_id' => $employeId,
                'type'            => 'tache_assignee',
                'message'         => "Une nouvelle tâche vous a été assignée par le responsable {$responsable->prenom} {$responsable->nom} : '{$tache->titre}'.",
                'lu'              => false
            ]);
        }

        // AUDIT
        $responsable   = Auth::user();
        $nomsEmployes  = $employes->map(fn($e) => "{$e->nom} {$e->prenom}")->join(', ');
        $this->logAudit("Tâche '{$tache->titre}' créée par {$responsable->nom} {$responsable->prenom} et assignée à : {$nomsEmployes}.");

        return response()->json([
            'message' => 'Tâche créée et assignée avec succès.',
            'data'    => $tache
        ], 201);
    }

    /**
     * L'employé met à jour le statut de sa tâche (À faire → En cours → Terminée)
     */
    public function updateStatut(Request $request, int $id)
    {
        $request->validate(['statut' => 'required|in:À faire,En cours,Terminée']);

        $affectation = AffectationTache::where('tache_id', $id)
            ->where('utilisateur_id', Auth::id())
            ->first();

        if (!$affectation) {
            return response()->json(['message' => 'Tâche introuvable ou non assignée à vous.'], 404);
        }

        $tache = Tache::findOrFail($id);
        $tache->update(['statut' => $request->statut]);

        // CDC 4.7 : Tâche terminée → notification au responsable
        if ($request->statut === 'Terminée') {
            $employe = Auth::user();
            Notification::create([
                'destinataire_id' => $tache->assigne_par,
                'type'            => 'tache_terminee',
                'message'         => "L'employé {$employe->prenom} {$employe->nom} a marqué la tâche '{$tache->titre}' comme Terminée. Veuillez la valider.",
                'lu'              => false
            ]);

            // AUDIT
            $this->logAudit("Tâche '{$tache->titre}' marquée Terminée par {$employe->nom} {$employe->prenom}.");
        }

        // Ajout : Notification au responsable quand la tâche passe En cours
        if ($request->statut === 'En cours') {
            $employe = Auth::user();
            Notification::create([
                'destinataire_id' => $tache->assigne_par,
                'type'            => 'tache_encours',
                'message'         => "L'employé {$employe->prenom} {$employe->nom} a commencé à travailler sur la tâche '{$tache->titre}' (Statut: En cours).",
                'lu'              => false
            ]);

            // AUDIT
            $this->logAudit("Tâche '{$tache->titre}' passée En cours par {$employe->nom} {$employe->prenom}.");
        }

        return response()->json(['message' => 'Statut de la tâche mis à jour.']);
    }

    /**
     * Le responsable valide et clôture la tâche (Terminée → Fermée)
     */
    public function validerTerminaison(Request $request, int $id)
    {
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $tache = Tache::findOrFail($id);

        if ($tache->statut !== 'Terminée') {
            return response()->json([
                'message' => 'Impossible de fermer une tâche qui n\'a pas encore été mise à l\'état Terminée par l\'employé.'
            ], 422);
        }

        $tache->update(['statut' => 'Fermée']);

        // Récupérer tous les employés assignés à cette tâche via la table pivot
        $assignations = AffectationTache::where('tache_id', $id)->get();
        $employesIds = $assignations->pluck('utilisateur_id')->unique();

        // Notification à chaque employé assigné
        $responsable = Auth::user();
        foreach ($employesIds as $employeId) {
            Notification::create([
                'destinataire_id' => $employeId,
                'type'            => 'tache_fermee',
                'message'         => "✅ Votre tâche '{$tache->titre}' a été validée et clôturée par le responsable {$responsable->prenom} {$responsable->nom}.",
                'lu'              => false
            ]);
        }

        // AUDIT
        $responsable = Auth::user();
        $this->logAudit("Tâche '{$tache->titre}' validée et fermée par {$responsable->nom} {$responsable->prenom}.");

        return response()->json(['message' => 'La tâche a été validée et clôturée avec succès.']);
    }

    /**
     * NOUVEAU : Le responsable annule la validation et rouvre la tâche (Terminée → En cours)
     */
    public function annulerTerminaison(Request $request, int $id)
    {
        if (Auth::user()->role_id !== 2) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $tache = Tache::findOrFail($id);

        if ($tache->statut !== 'Terminée') {
            return response()->json([
                'message' => 'Impossible d\'annuler une tâche qui n\'est pas à l\'état Terminée.'
            ], 422);
        }

        $tache->update(['statut' => 'En cours']);

        // Notification à l'employé qui avait terminé la tâche
        $responsable = Auth::user();
        $assignations = AffectationTache::where('tache_id', $id)->get();
        $employesIds = $assignations->pluck('utilisateur_id')->unique();

        foreach ($employesIds as $employeId) {
            Notification::create([
                'destinataire_id' => $employeId,
                'type'            => 'tache_rouverte',
                'message'         => "❌ La tâche '{$tache->titre}' a été rejetée et rouverte par le responsable {$responsable->prenom} {$responsable->nom}. Veuillez la reprendre.",
                'lu'              => false
            ]);
        }

        // AUDIT
        $responsable = Auth::user();
        $this->logAudit("Tâche '{$tache->titre}' annulée et rouverte par {$responsable->nom} {$responsable->prenom}.");

        return response()->json(['message' => 'La tâche a été annulée et rouverte avec succès.']);
    }

    /**
     * Récupérer les tâches de l'utilisateur connecté via la table pivot
     */
    public function mesTaches()
    {
        $tachesIds = AffectationTache::where('utilisateur_id', Auth::id())
            ->pluck('tache_id');

        return Tache::whereIn('id', $tachesIds)
            ->orderBy('created_at', 'desc')
            ->get();
    }
    public function allTasks()
{
    // Récupère toutes les tâches avec leurs employés assignés
    return Tache::with('employes')
        ->orderBy('created_at', 'desc')
        ->get();
}
}