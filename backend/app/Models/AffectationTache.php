<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['tache_id', 'user_id', 'assigne_par'])]
class AffectationTache extends Model
{
    use HasFactory;

    // La tâche concernée
    public function tache()
    {
        return $this->belongsTo(Tache::class);
    }

    // L'employé à qui on a donné la tâche
    public function employe()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}