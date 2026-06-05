<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'objet' => 'required|string',
            'description' => 'required|string'
        ]);

        // LOGIQUE D'ANALYSE INTELLIGENTE (Priorité automatique)
        $desc = strtolower($request->description);
        $priorite = 'Basse'; // Par défaut

        if (str_contains($desc, 'urgent') || str_contains($desc, 'panne') || str_contains($desc, 'bloqué') || str_contains($desc, 'immédiat')) {
            $priorite = 'Haute';
        } elseif (str_contains($desc, 'problème') || str_contains($desc, 'erreur') || str_contains($desc, 'accès')) {
            $priorite = 'Moyenne';
        }

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'objet' => $request->objet,
            'description' => $request->description,
            'priorite' => $priorite, // Appliquée automatiquement
            'statut' => 'Ouvert'
        ]);

        return response()->json(['message' => 'Ticket créé avec priorité : ' . $priorite, 'data' => $ticket]);
    }

    public function resoudre(int $id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->update(['statut' => 'Résolu']);

        Notification::create([
            'destinataire_id' => $ticket->user_id,
            'type' => 'ticket_resolu',
            'message' => "Votre ticket '{$ticket->objet}' a été résolu. Veuillez confirmer.",
            'lu' => false
        ]);

        return response()->json(['message' => 'Ticket marqué comme résolu']);
    }

    public function confirmer(int $id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->update(['statut' => 'Fermé']); // Cycle final du point 4.4

        Notification::create([
            'destinataire_id' => $ticket->technicien_id ?? $ticket->user_id, // Alerte au tech
            'type' => 'ticket_ferme',
            'message' => "L'employé a confirmé la résolution du ticket '{$ticket->objet}'.",
            'lu' => false
        ]);

        return response()->json(['message' => 'Ticket fermé définitivement']);
    }
}