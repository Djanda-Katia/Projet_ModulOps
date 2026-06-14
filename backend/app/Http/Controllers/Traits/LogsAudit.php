<?php

namespace App\Http\Controllers\Traits;

use App\Models\Audit;
use Illuminate\Support\Facades\Auth;

trait LogsAudit
{
    /**
     * Enregistre une entrée dans le journal d'audit.
     *
     * @param string $action  Description de l'action (ex: "Création de compte")
     */
    protected function logAudit(string $action): void
    {
        $user = Auth::user();

        Audit::create([
            'action'      => $action,
            'utilisateur' => $user ? "{$user->nom} {$user->prenom} ({$user->email})" : 'Système',
        ]);
    }
}