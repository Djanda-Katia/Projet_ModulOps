<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conge extends Model
{
    use HasFactory;

    // On autorise le remplissage de ces colonnes
    protected $fillable = [
        'user_id',
        'type',
        'date_debut',
        'date_fin',
        'status',
        'commentaire'
    ];

    // Relation : Un congé appartient à un Utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}