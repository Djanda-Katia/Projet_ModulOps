<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'date_debut', 'date_fin', 'type_conge', 'motif', 'statut'])]
class DemandeConge extends Model
{
    use HasFactory;

    /**
     * Une demande de congé appartient à un utilisateur (Employé/Responsable/etc.)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}