<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'fonction',
        'role_id',
        'solde_conge',
        'periode_conges_annuels',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'solde_conge'       => 'integer',
            'periode_conges_annuels' => 'array',
        ];
    }

    /**
     * Notifications reçues par cet utilisateur
     */
    public function mesNotifications()
    {
        return $this->hasMany(Notification::class, 'destinataire_id');
    }

    /**
     * Demandes de congé de cet utilisateur
     */
    public function conges()
    {
        return $this->hasMany(DemandeConge::class);
    }

    /**
     * Tickets créés par cet utilisateur (employé ou responsable)
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id');
    }

    /**
     * Tickets assignés à cet utilisateur (technicien)
     */
    public function ticketsAssignes()
    {
        return $this->hasMany(Ticket::class, 'technicien_id');
    }

    /**
     * Tâches assignées à cet utilisateur via la table pivot
     */
    public function taches()
    {
        return $this->hasManyThrough(
            Tache::class,
            AffectationTache::class,
            'utilisateur_id',
            'id',
            'id',
            'tache_id'
        );
    }
}