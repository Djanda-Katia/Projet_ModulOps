<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DemandeConge;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

class CheckLeaveStatus extends Command
{
    protected $signature = 'leaves:check';
    protected $description = 'Vérifie les congés débutant ou terminant aujourd\'hui et envoie des notifications';

    public function handle()
    {
        $today = Carbon::now('Africa/Douala')->toDateString();
        $managers = User::where('role_id', 2)->get();

        // ── 1. Congés débutant aujourd'hui ──
        $startingLeaves = DemandeConge::where('statut', 'Approuvée')
            ->whereDate('date_debut', $today)
            ->with('user')
            ->get();

        foreach ($startingLeaves as $conge) {
            $nom = "{$conge->user->prenom} {$conge->user->nom}";
            $type = $conge->type_conge;
            $fin  = Carbon::parse($conge->date_fin)->locale('fr')->isoFormat('D MMMM YYYY');

            // Notification à l'employé
            Notification::create([
                'destinataire_id' => $conge->user_id,
                'type'            => 'conge_debut',
                'message'         => "🟢 Votre congé {$type} a débuté aujourd'hui. Bon congé jusqu'au {$fin} !",
                'lu'              => false,
            ]);

            // Notification à chaque responsable
            foreach ($managers as $manager) {
                Notification::create([
                    'destinataire_id' => $manager->id,
                    'type'            => 'conge_debut',
                    'message'         => "🟢 Le congé {$type} de {$nom} a débuté aujourd'hui (jusqu'au {$fin}).",
                    'lu'              => false,
                ]);
            }
        }

        // ── 2. Congés se terminant aujourd'hui ──
        $endingLeaves = DemandeConge::where('statut', 'Approuvée')
            ->whereDate('date_fin', $today)
            ->with('user')
            ->get();

        foreach ($endingLeaves as $conge) {
            $nom  = "{$conge->user->prenom} {$conge->user->nom}";
            $type = $conge->type_conge;

            // Notification à l'employé
            Notification::create([
                'destinataire_id' => $conge->user_id,
                'type'            => 'conge_fin',
                'message'         => "🔵 Votre congé {$type} se termine aujourd'hui. Bon retour parmi nous !",
                'lu'              => false,
            ]);

            // Notification à chaque responsable
            foreach ($managers as $manager) {
                Notification::create([
                    'destinataire_id' => $manager->id,
                    'type'            => 'conge_fin',
                    'message'         => "🔵 Le congé {$type} de {$nom} prend fin aujourd'hui.",
                    'lu'              => false,
                ]);
            }
        }

        $this->info("✅ Vérification terminée : {$startingLeaves->count()} congé(s) débutant, {$endingLeaves->count()} congé(s) terminant.");
    }
}
