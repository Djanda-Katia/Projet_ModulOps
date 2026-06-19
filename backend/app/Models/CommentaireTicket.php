<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CommentaireTicket extends Model
{
    use HasFactory;
    protected $table = 'commentaires_ticket';
    // Synchronisation parfaite avec les colonnes 'ticket_id', 'auteur_id' et 'contenu' de ta migration
    protected $fillable = [
        'ticket_id', 
        'auteur_id', 
        'contenu'
    ];

    // Qui a écrit le message (Clé étrangère calquée sur 'auteur_id')
    public function auteur()
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    // À quel ticket appartient ce message
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
