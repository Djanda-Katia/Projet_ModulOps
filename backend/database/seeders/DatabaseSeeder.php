<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // SÉCURITÉ : On insère d'abord les rôles si la table est vide
        if (DB::table('roles')->count() == 0) {
            DB::table('roles')->insert([
                ['id' => 1, 'libelle' => 'Employé'],
                ['id' => 2, 'libelle' => 'Responsable'],
                ['id' => 3, 'libelle' => 'Technicien'],
                ['id' => 4, 'libelle' => 'Administrateur'],
            ]);
        }

        // 1. CRÉATION DE L'EMPLOYÉ (Rôle 1)
        User::create([
            'nom' => 'Ewondo',
            'prenom' => 'Marie',
            'email' => 'marie.employe@entreprise.com',
            'password' => Hash::make('password123'),
            'role_id' => 1,
            'fonction' => 'Rédactrice Web',
            'solde_conge' => 30,
        ]);

        // 2. CRÉATION DU RESPONSABLE (Rôle 2)
        User::create([
            'nom' => 'Tchinda',
            'prenom' => 'Paul',
            'email' => 'paul.responsable@entreprise.com',
            'password' => Hash::make('password123'),
            'role_id' => 2,
            'fonction' => 'Chef de Projet',
            'solde_conge' => 30,
        ]);

        // 3. CRÉATION DU TECHNICIEN (Rôle 3)
        User::create([
            'nom' => 'Kamga',
            'prenom' => 'Luc',
            'email' => 'luc.technicien@entreprise.com',
            'password' => Hash::make('password123'),
            'role_id' => 3,
            'fonction' => 'Technicien Réseau',
            'solde_conge' => 30,
        ]);

        // 4. CRÉATION DE L'ADMINISTRATEUR (Rôle 4)
        User::create([
            'nom' => 'Tchakounté',
            'prenom' => 'Hubert',
            'email' => 'hubert.admin@entreprise.com',
            'password' => Hash::make('password123'),
            'role_id' => 4,
            'fonction' => 'Administrateur Principal',
            'solde_conge' => 30,
        ]);
    }
}