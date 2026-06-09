<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\CommentaireTicket;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    // Liste des tickets filtrée selon le rôle
    public function index()
    {
        $user = Auth::user();

        // Le technicien (rôle 3) voit les tickets qui lui sont assignés
        if ($user->role_id === 3) {
            return Ticket::where('technicien_id', $user->id)->orderBy('created_at', 'desc')->get();
        }

        // L'employé voit ses propres tickets soumis
        return Ticket::where('user_id', $user->id)->orderBy('created_at', 'desc')->get();
    }

    /**
     * Création d'un ticket avec ta classification par mots-clés conservée intacte !
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'categorie' => 'required|string'
        ]);

        $description = strtolower($request->description);
        $titre = strtolower($request->titre);
        $priorite = 'Basse'; // Statut par défaut si aucun mot-clé n'est matché

        // CONSERVATION DE TES MOTS-CLÉS EXACTS
        $motsClesHaute = ['panne', 'bloqué', 'impossible', 'urgent', 'crash', 'serveur', 'incendie', 'coupure'];
        $motsClesMoyenne = ['lent', 'problème', 'erreur', 'imprimante', 'accès', 'logiciel', 'bug'];

        foreach ($motsClesHaute as $mot) {
            if (str_contains($description, $mot) || str_contains($titre, $mot)) {
                $priorite = 'Haute';
                break;
            }
        }

        if ($priorite === 'Basse') {
            foreach ($motsClesMoyenne as $mot) {
                if (str_contains($description, $mot) || str_contains($titre, $mot)) {
                    $priorite = 'Moyenne';
                    break;
                }
            }
        }

        // Attribution automatique à un technicien disponible (Rôle 3)
        $technicien = User::where('role_id', 3)->inRandomOrder()->first();

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'technicien_id' => $technicien ? $technicien->id : null,
            'titre' => $request->titre,
            'description' => $request->description,
            'categorie' => $request->categorie,
            'priorite' => $priorite, // Appliqué uniquement sur le ticket
            'statut' => 'Ouvert'
        ]);

        // Notification au technicien assigné
        if ($technicien) {
            Notification::create([
                'destinataire_id' => $technicien->id,
                'type' => 'ticket_assigne',
                'message' => "Un nouveau ticket (Priorité : {$priorite}) vous a été attribué : '{$ticket->titre}'.",
                'lu' => false
            ]);
        }

        return response()->json(['message' => 'Ticket créé avec succès', 'priorite' => $priorite, 'data' => $ticket], 201);
    }

    // Le technicien ajoute un commentaire et passe le statut à "Résolu"
    public function ajouterCommentaire(Request $request, int $id)
    {
        $request->validate([
            'contenu' => 'required|string',
            'statut' => 'nullable|in:En cours,Résolu'
        ]);

        $ticket = Ticket::findOrFail($id);

        // Insertion dans commentaires_ticket avec tes bonnes colonnes (auteur_id, contenu)
        CommentaireTicket::create([
            'ticket_id' => $ticket->id,
            'auteur_id' => Auth::id(),
            'contenu' => $request->contenu
        ]);

        if ($request->has('statut')) {
            $ticket->update(['statut' => $request->statut]);

            // Si le ticket est résolu, on avertit l'employé pour qu'il vienne confirmer
            if ($request->statut === 'Résolu') {
                Notification::create([
                    'destinataire_id' => $ticket->user_id,
                    'type' => 'ticket_resolu',
                    'message' => "Votre ticket '{$ticket->titre}' a été marqué comme Résolu. Veuillez confirmer la résolution.",
                    'lu' => false
                ]);
            }
        }

        return response()->json(['message' => 'Commentaire ajouté et statut mis à jour.']);
    }

    /**
     * L'employé confirme que l'incident est bel et bien réglé (Résolu -> Fermé)
     */
    public function confirmerResolution(int $id)
    {
        // Seul l'employé propriétaire du ticket peut confirmer
        $ticket = Ticket::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        if ($ticket->statut !== 'Résolu') {
            return response()->json(['message' => 'Vous ne pouvez pas confirmer un ticket qui n\'est pas à l\'état résolu.'], 422);
        }

        // Passage à l'état final verrouillé
        $ticket->update(['statut' => 'Fermé']);

        // Notification au technicien pour boucler le circuit (Point 4.7)
        if ($ticket->technicien_id) {
            Notification::create([
                'destinataire_id' => $ticket->technicien_id,
                'type' => 'confirmation_resolution',
                'message' => "L'employé a confirmé la bonne résolution du ticket : '{$ticket->titre}'. Le ticket est fermé.",
                'lu' => false
            ]);
        }

        return response()->json(['message' => 'Merci pour votre confirmation. Le ticket est maintenant fermé.']);
    }
}