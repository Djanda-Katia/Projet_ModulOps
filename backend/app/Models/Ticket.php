<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ticket extends Model
{
    use HasFactory;

    // CORRECTION : 'objet' remplacé par 'titre', 'categorie' ajouté
    protected $fillable = [
        'user_id',
        'technicien_id',
        'titre',
        'description',
        'categorie',
        'priorite',
        'statut'
    ];

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

    // Les commentaires du ticket
    public function commentaires()
    {
        return $this->hasMany(CommentaireTicket::class);
    }
}