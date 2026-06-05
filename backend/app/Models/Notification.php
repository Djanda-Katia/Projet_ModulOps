<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    // On utilise destinataire_id comme écrit dans ton cahier des charges (Source 160)
    protected $fillable = ['destinataire_id', 'type', 'message', 'lu'];

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }
}