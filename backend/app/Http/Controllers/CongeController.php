<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conge;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class CongeController extends Controller
{
    /**
     * Liste des congés (Point 4.3 - Historique)
     */
    public function index()
    {
        // Un responsable (2) ou admin (4) voit tout, l'employé voit les siens
        if (in_array(Auth::user()->role_id, [2, 4])) {
            return Conge::with('user')->orderBy('created_at', 'desc')->get();
        }
        return Conge::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();
    }

    /**
     * Soumission d'une demande par l'employé
     */
    public function soumettreDemande(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'commentaire' => 'nullable|string' // Optionnel pour l'employé
        ]);

        $conge = Conge::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'status' => 'En attente',
            'commentaire' => $request->commentaire
        ]);

        return response()->json(['message' => 'Demande envoyée avec succès', 'data' => $conge], 201);
    }

    /**
     * Décision du responsable (Acceptation/Refus avec motif)
     */
    public function decider(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:Approuvée,Rejetée',
            // Si c'est Rejetée, le champ "motif" est obligatoire. 
            // Si c'est Approuvée, le champ "commentaire" est optionnel.
            'motif' => 'required_if:status,Rejetée|string|nullable',
            'commentaire' => 'nullable|string'
        ]);

        $conge = Conge::findOrFail($id);

        // On détermine ce qu'on enregistre dans la colonne 'commentaire' de la base
        $feedback = ($request->status === 'Rejetée') ? $request->motif : $request->commentaire;

        $conge->update([
            'status' => $request->status,
            'commentaire' => $feedback 
        ]);

        // Envoi de la notification à l'employé
        $messageNotif = ($request->status === 'Rejetée') 
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
            'message' => "La demande a été " . strtolower($request->status)
        ]);
    }
}