<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tache extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assigne_par',
        'titre',
        'description',
        'statut'
    ];

    public function employe()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function responsable()
    {
        return $this->belongsTo(User::class, 'assigne_par');
    }

    // ✅ AJOUTE CETTE RELATION ICI
    public function employes()
    {
        return $this->belongsToMany(User::class, 'affectations_tache', 'tache_id', 'utilisateur_id');
    }
}