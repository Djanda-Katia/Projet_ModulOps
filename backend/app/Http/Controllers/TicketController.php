<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\CommentaireTicket;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Traits\LogsAudit;

class TicketController extends Controller
{
    use LogsAudit;

    /**
     * Liste des tickets filtrée selon le rôle et le statut
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Construire la requête de base selon le rôle
        if ($user->role_id === 3) {
            // Technicien : voir ses tickets assignés
            $query = Ticket::where('technicien_id', $user->id);
        } else {
            // Employé ou Responsable : voir leurs propres tickets
            $query = Ticket::where('user_id', $user->id);
        }

        // Ajouter le filtre par statut si le paramètre est présent
        if ($request->has('statut') && in_array($request->statut, ['Ouvert', 'En cours', 'Résolu', 'Fermé'])) {
            $query->where('statut', $request->statut);
        }

        // Trier par date de création (le plus récent en premier)
        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Création d'un ticket avec classification par mots-clés et attribution MANUELLE du technicien
     * CDC 4.4 : c'est le créateur du ticket (employé ou responsable) qui choisit le technicien
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre'         => 'required|string|max:255',
            'description'   => 'required|string',
            'categorie'     => 'required|string',
            'technicien_id' => 'required|exists:users,id',
        ]);

        // Vérification que l'utilisateur choisi est bien un technicien (rôle 3)
        $technicien = User::findOrFail($request->technicien_id);
        if ($technicien->role_id !== 3) {
            return response()->json([
                'message' => "L'utilisateur sélectionné n'est pas un technicien."
            ], 422);
        }

        // Classification automatique de la priorité par mots-clés (CDC 4.4)
        $description = strtolower($request->description);
        $titre       = strtolower($request->titre);
        $priorite    = 'Basse';

        $motsClesHaute   = ['panne', 'bloqué', 'impossible', 'urgent', 'crash', 'serveur', 'incendie', 'coupure'];
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

        $ticket = Ticket::create([
            'user_id'       => Auth::id(),
            'technicien_id' => $technicien->id,
            'titre'         => $request->titre,
            'description'   => $request->description,
            'categorie'     => $request->categorie,
            'priorite'      => $priorite,
            'statut'        => 'Ouvert'
        ]);

        // CDC 4.7 : Notification au technicien lors de l'assignation
        Notification::create([
            'destinataire_id' => $technicien->id,
            'type'            => 'ticket_assigne',
            'message'         => "Un nouveau ticket (Priorité : {$priorite}) vous a été attribué : '{$ticket->titre}'.",
            'lu'              => false
        ]);

        // AUDIT
        $createur = Auth::user();
        $this->logAudit("Création du ticket '{$ticket->titre}' (Priorité : {$priorite}) par {$createur->nom} {$createur->prenom}, assigné à {$technicien->nom} {$technicien->prenom}.");

        return response()->json([
            'message'  => 'Ticket créé avec succès',
            'priorite' => $priorite,
            'data'     => $ticket
        ], 201);
    }

    /**
     * Le technicien ajoute un commentaire et peut changer le statut (En cours / Résolu)
     * CORRECTION : seul le technicien assigné à ce ticket peut commenter.
     * Les employés et responsables n'ont pas accès.
     */
    public function ajouterCommentaire(Request $request, int $id)
    {
        // Vérifier que l'utilisateur connecté est un technicien (rôle 3)
        if (Auth::user()->role_id !== 3) {
            return response()->json(['message' => 'Seul un technicien peut ajouter un commentaire.'], 403);
        }

        $request->validate([
            'contenu' => 'required|string',
            'statut'  => 'nullable|in:En cours,Résolu'
        ]);

        $ticket = Ticket::findOrFail($id);

        // Vérifier que ce technicien est bien celui assigné au ticket
        if ($ticket->technicien_id !== Auth::id()) {
            return response()->json(['message' => 'Ce ticket ne vous est pas assigné.'], 403);
        }

        CommentaireTicket::create([
            'ticket_id' => $ticket->id,
            'auteur_id' => Auth::id(),
            'contenu'   => $request->contenu
        ]);

        if ($request->has('statut')) {
            $ticket->update(['statut' => $request->statut]);

            // CDC 4.7 : Ticket résolu → notification au créateur du ticket
            if ($request->statut === 'Résolu') {
                Notification::create([
                    'destinataire_id' => $ticket->user_id,
                    'type'            => 'ticket_resolu',
                    'message'         => "Votre ticket '{$ticket->titre}' a été marqué comme Résolu. Veuillez confirmer la résolution.",
                    'lu'              => false
                ]);

                // AUDIT
                $technicien = Auth::user();
                $this->logAudit("Ticket '{$ticket->titre}' marqué comme Résolu par {$technicien->nom} {$technicien->prenom}.");
            }

            if ($request->statut === 'En cours') {
                // AUDIT
                $technicien = Auth::user();
                $this->logAudit("Ticket '{$ticket->titre}' passé En cours par {$technicien->nom} {$technicien->prenom}.");
            }
        }

        return response()->json(['message' => 'Commentaire ajouté et statut mis à jour.']);
    }

    /**
     * L'employé ou le responsable confirme que le ticket est réglé (Résolu → Fermé)
     */
    public function confirmerResolution(int $id)
    {
        $ticket = Ticket::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($ticket->statut !== 'Résolu') {
            return response()->json([
                'message' => 'Vous ne pouvez pas confirmer un ticket qui n\'est pas à l\'état Résolu.'
            ], 422);
        }

        $ticket->update(['statut' => 'Fermé']);

        // CDC 4.7 : Ticket fermé → notification au technicien
        if ($ticket->technicien_id) {
            Notification::create([
                'destinataire_id' => $ticket->technicien_id,
                'type'            => 'ticket_ferme',
                'message'         => "Le ticket '{$ticket->titre}' a été confirmé et fermé. Merci pour votre intervention.",
                'lu'              => false
            ]);
        }

        // AUDIT
        $confirmateur = Auth::user();
        $this->logAudit("Ticket '{$ticket->titre}' fermé et confirmé par {$confirmateur->nom} {$confirmateur->prenom}.");

        return response()->json(['message' => 'Merci pour votre confirmation. Le ticket est maintenant fermé.']);
    }

    /**
     * L'utilisateur signale un problème (rouvre le ticket)
     */
    public function signalerProbleme(int $id)
    {
        $ticket = Ticket::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($ticket->statut !== 'Résolu') {
            return response()->json(['message' => 'Seul un ticket résolu peut être signalé.'], 422);
        }

        $ticket->update(['statut' => 'En cours']);

        // Optionnel : ajouter un commentaire automatique
        CommentaireTicket::create([
            'ticket_id' => $ticket->id,
            'auteur_id' => Auth::id(),
            'contenu'   => "Le problème n'est pas résolu. Ticket rouvert."
        ]);

        return response()->json(['message' => 'Problème signalé, ticket rouvert.']);
    }
}