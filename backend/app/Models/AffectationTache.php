<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AffectationTache extends Model
{
    use HasFactory;

    // Déclaration standard et robuste pour éviter tout problème d'interprétation d'attribut PHP 8
    protected $fillable = [
        'tache_id', 
        'utilisateur_id', 
        'assigne_par'
    ];

    // La tâche concernée
    public function tache()
    {
        return $this->belongsTo(Tache::class);
    }

    // L'employé à qui on a donné la tâche (Synchronisé avec 'utilisateur_id' de la migration)
    public function employe()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}