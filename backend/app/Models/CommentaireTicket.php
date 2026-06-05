<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ticket_id', 'user_id', 'message'])]
class CommentaireTicket extends Model
{
    use HasFactory;

    // Qui a écrit le message
    public function auteur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // À quel ticket appartient ce message
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}