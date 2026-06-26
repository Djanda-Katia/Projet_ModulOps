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

    /** Retourne le label lisible du role de l'utilisateur */
    private function roleLabel(User $user): string
    {
        return match($user->role_id) {
            1 => "L'employe",
            2 => 'Le responsable',
            3 => 'Le technicien',
            4 => "L'administrateur",
            default => "L'utilisateur",
        };
    }

    /**
     * Liste des tickets filtrée selon le rôle et le statut
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Construire la requête de base selon le rôle
        if ($user->role_id === 3) {
            // Technicien : voir ses tickets assignés ET charger les infos du demandeur (auteur)
            $query = Ticket::with('auteur')->where('technicien_id', $user->id);
            if ($request->has('personne_id') && $request->personne_id) {
                $query->whereIn('user_id', explode(',', $request->personne_id));
            }
        } else {
            // Employé ou Responsable : voir leurs propres tickets ET charger les infos du technicien assigné
            $query = Ticket::with('technicien')->where('user_id', $user->id);
            if ($request->has('personne_id') && $request->personne_id) {
                $query->whereIn('technicien_id', explode(',', $request->personne_id));
            }
        }

        // Ajouter le filtre par statut multi
        if ($request->has('statut') && $request->statut) {
            $query->whereIn('statut', explode(',', $request->statut));
        }

        // Périodes prédéfinies
        if ($request->has('periode') && $request->periode) {
            $now = \Carbon\Carbon::now();
            switch ($request->periode) {
                case '7j': $query->where('created_at', '>=', $now->copy()->subDays(7)); break;
                case '15j': $query->where('created_at', '>=', $now->copy()->subDays(15)); break;
                case '30j': $query->where('created_at', '>=', $now->copy()->subDays(30)); break;
                case '60j': $query->where('created_at', '>=', $now->copy()->subDays(60)); break;
                case 'plus_1an': $query->where('created_at', '<', $now->copy()->subYear()); break;
            }
        }

        if ($request->has('dates') && $request->dates) {
            $datesArray = explode(',', $request->dates);
            $query->whereIn(\Illuminate\Support\Facades\DB::raw('DATE(created_at)'), $datesArray);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titre', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('categorie', 'like', "%{$search}%");
            });
        }

        // Trier par date de création (le plus récent en premier) et paginer
        return $query->orderBy('created_at', 'desc')->paginate(10);
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

        // AUDIT + Notification
        $createur = Auth::user();

        // CDC 4.7 : Notification au technicien lors de l'assignation
        Notification::create([
            'destinataire_id' => $technicien->id,
            'type'            => 'ticket_assigne',
            'message'         => "{$this->roleLabel($createur)} {$createur->prenom} {$createur->nom} vous a assigné un nouveau ticket [{$priorite}] : '{$ticket->titre}'.",
            'lu'              => false
        ]);

        $this->logAudit("Création du ticket '{$ticket->titre}' (Priorité : {$priorite}) par {$createur->nom} {$createur->prenom}, assigné à {$technicien->nom} {$technicien->prenom}.");

        return response()->json([
            'message'  => 'Ticket créé avec succès',
            'priorite' => $priorite,
            'data'     => $ticket
        ], 201);
    }

    /**
     * Le technicien ajoute un commentaire et peut changer le statut (En cours / Résolu)
     */
    public function ajouterCommentaire(Request $request, int $id)
    {
        // Vérifier que l'utilisateur connecté est un technicien (rôle 3)
        if (Auth::user()->role_id !== 3) {
            return response()->json(['message' => 'Seul un technicien peut ajouter un commentaire.'], 403);
        }

        $request->validate([
            'contenu' => 'required|string',
            'statut'  => 'nullable|in:Ouvert,En cours,Résolu'
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
                $technicien = Auth::user();
                Notification::create([
                    'destinataire_id' => $ticket->user_id,
                    'type'            => 'ticket_resolu',
                    'message'         => "Le technicien {$technicien->prenom} {$technicien->nom} a marqué votre ticket '{$ticket->titre}' comme Résolu. Veuillez le confirmer.",
                    'lu'              => false
                ]);

                // AUDIT
                $this->logAudit("Ticket '{$ticket->titre}' marqué comme Résolu par {$technicien->nom} {$technicien->prenom}.");
            }

            if ($request->statut === 'En cours') {
                $technicien = Auth::user();
                // Notification au créateur du ticket
                Notification::create([
                    'destinataire_id' => $ticket->user_id,
                    'type'            => 'ticket_encours',
                    'message'         => "Le technicien {$technicien->prenom} {$technicien->nom} a pris en charge votre ticket '{$ticket->titre}' (Statut: En cours).",
                    'lu'              => false
                ]);
                // AUDIT
                $this->logAudit("Ticket '{$ticket->titre}' passé En cours par {$technicien->nom} {$technicien->prenom}.");
            }
        }

        return response()->json(['message' => 'Commentaire ajouté et statut mis à jour.']);
    }

    /**
     * Récupérer un ticket spécifique avec ses commentaires
     */
    public function show(int $id)
    {
        $user = Auth::user();
        
        // CORRECTION ICI : On ajoute 'auteur' et 'technicien' pour avoir les noms !
        $ticket = Ticket::with(['auteur', 'technicien', 'commentaires.auteur'])
            ->where('id', $id)
            ->firstOrFail();

        // Vérification que l'utilisateur a le droit de voir ce ticket
        if ($user->role_id === 3) {
            if ($ticket->technicien_id !== $user->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        } else {
            if ($ticket->user_id !== $user->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }

        return response()->json($ticket);
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
        $confirmateur = Auth::user();
        if ($ticket->technicien_id) {
            Notification::create([
                'destinataire_id' => $ticket->technicien_id,
                'type'            => 'ticket_ferme',
                'message'         => "{$confirmateur->prenom} {$confirmateur->nom} a confirmé la résolution et fermé le ticket '{$ticket->titre}'.",
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
    public function signalerProbleme(Request $request, int $id)
    {
        $ticket = Ticket::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($ticket->statut !== 'Résolu') {
            return response()->json(['message' => 'Seul un ticket résolu peut être signalé.'], 422);
        }

        $ticket->update(['statut' => 'En cours']);

        // Message personnalisé de l'utilisateur ou message par défaut
        $message = $request->input('message', 'Le problème n\'est pas résolu.');

        CommentaireTicket::create([
            'ticket_id' => $ticket->id,
            'auteur_id' => Auth::id(),
            'contenu'   => "⚠️ Problème signalé par l'utilisateur : {$message}"
        ]);

        // Notifier le technicien assigné
        $signaleur = Auth::user();
        if ($ticket->technicien_id) {
            Notification::create([
                'destinataire_id' => $ticket->technicien_id,
                'type'            => 'ticket_signale',
                'message'         => "⚠️ {$signaleur->prenom} {$signaleur->nom} a signalé que le problème persiste sur le ticket '{$ticket->titre}'. Veuillez intervenir.",
                'lu'              => false
            ]);
        }

        $signaleur = Auth::user();
        $this->logAudit("Ticket '{$ticket->titre}' signalé par {$signaleur->nom} {$signaleur->prenom}.");

        return response()->json(['message' => 'Problème signalé, ticket rouvert.']);
    }

    /**
     * Supprime un ticket (seulement s'il est Ouvert et par son auteur)
     */
    public function destroy(int $id)
    {
        $ticket = Ticket::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        if ($ticket->statut !== 'Ouvert') {
            return response()->json(['message' => 'Impossible de supprimer un ticket qui n\'est plus Ouvert.'], 422);
        }

        // Notifier le technicien de l'annulation
        $auteur = Auth::user();
        if ($ticket->technicien_id) {
            Notification::create([
                'destinataire_id' => $ticket->technicien_id,
                'type'            => 'ticket_annule',
                'message'         => "❌ L'utilisateur {$auteur->prenom} {$auteur->nom} a annulé et supprimé le ticket '{$ticket->titre}'.",
                'lu'              => false
            ]);
        }

        $ticket->delete();

        $this->logAudit("Ticket '{$ticket->titre}' supprimé par son auteur {$auteur->nom} {$auteur->prenom}.");

        return response()->json(['message' => 'Ticket supprimé avec succès.']);
    }

    /**
     * L'auteur ferme un ticket anticipément (seulement s'il est En cours) avec motif
     */
    public function fermerParAuteur(Request $request, int $id)
    {
        $request->validate(['motif' => 'required|string']);

        $ticket = Ticket::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        if ($ticket->statut !== 'En cours') {
            return response()->json(['message' => 'Seul un ticket En cours peut être fermé de cette manière.'], 422);
        }

        $ticket->update(['statut' => 'Fermé']);
        $auteur = Auth::user();

        // Ajouter le motif en commentaire
        CommentaireTicket::create([
            'ticket_id' => $ticket->id,
            'auteur_id' => Auth::id(),
            'contenu'   => "🔒 Ticket fermé par l'auteur. Motif : " . $request->motif
        ]);

        if ($ticket->technicien_id) {
            Notification::create([
                'destinataire_id' => $ticket->technicien_id,
                'type'            => 'ticket_ferme_anticipement',
                'message'         => "🔒 {$auteur->prenom} {$auteur->nom} a fermé le ticket '{$ticket->titre}'. Motif : {$request->motif}",
                'lu'              => false
            ]);
        }

        $this->logAudit("Ticket '{$ticket->titre}' fermé anticipément par {$auteur->nom} {$auteur->prenom}.");

        return response()->json(['message' => 'Ticket fermé avec succès.']);
    }
}