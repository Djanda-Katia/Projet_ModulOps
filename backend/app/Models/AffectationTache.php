<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AffectationTache extends Model
{
    use HasFactory;
    protected $table = 'affectations_tache';
    // CORRECTION : 'assigne_par' retiré car absent de la migration affectations_tache
    protected $fillable = [
        'tache_id',
        'utilisateur_id',
    ];

    // La tâche concernée
    public function tache()
    {
        return $this->belongsTo(Tache::class);
    }

    // L'employé à qui on a donné la tâche
    public function employe()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}