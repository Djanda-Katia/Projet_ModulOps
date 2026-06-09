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
        'role_id'
    ];

    protected $hidden = [
        'password', 
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * RELATION POUR LES NOTIFICATIONS (Point 134)
     * Permet de faire : Auth::user()->mesNotifications
     */
    public function mesNotifications()
    {
        return $this->hasMany(Notification::class, 'destinataire_id');
    }

    /**
     * RELATION POUR LES CONGÉS
     */
    public function conges()
    {
        return $this->hasMany(DemandeConge::class);
    }

    /**
     * RELATION POUR LES TICKETS (En tant qu'auteur)
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'user_id');
    }

    /**
     * RELATION POUR LES TICKETS ASSIGNÉS (Si technicien)
     */
    public function ticketsAssignes()
    {
        return $this->hasMany(Ticket::class, 'technicien_id');
    }
}