<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DemandeConge extends Model
{
    use HasFactory;

    // C'est ICI la correction : on dit à Laravel que la table s'appelle "demande_conges"
    protected $table = 'demandes_conge';

    protected $fillable = [
        'user_id', 
        'date_debut', 
        'date_fin', 
        'type_conge', 
        'motif', 
        'statut'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}