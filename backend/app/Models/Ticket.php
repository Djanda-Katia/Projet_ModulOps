<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;


class Ticket extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'technicien_id', 'objet', 'description', 'priorite', 'statut'];
    // L'employé qui a créé le ticket
    public function auteur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Le technicien assigné au ticket
    public function technicien()
    {
        return $this->belongsTo(User::class, 'technicien_id');
    }
    // Dans Ticket.php, ajoute ça en dessous de la relation auteur()
    public function commentaires()
    {
    return $this->hasMany(CommentaireTicket::class);
    }
}