<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DemandeConge extends Model
{
    use HasFactory;

    // Déclaration standard, sécurisée et robuste pour Laravel
    protected $fillable = [
        'user_id', 
        'date_debut', 
        'date_fin', 
        'type_conge', 
        'motif', 
        'statut'
    ];

    /**
     * Une demande de congé appartient à un utilisateur (Employé/Responsable/etc.)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}