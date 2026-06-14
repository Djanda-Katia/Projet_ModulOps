<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('taches', function (Blueprint $table) {
            $table->id();

            // L'employé principal à qui on confie la tâche
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Celui qui a créé la tâche (le Responsable)
            $table->foreignId('assigne_par')->constrained('users')->onDelete('cascade');

            $table->string('titre');
            $table->text('description')->nullable();

            // CORRECTION : date_echeance supprimée (retirée du périmètre)
            // Statut : À faire → En cours → Terminée → Fermée
            $table->string('statut')->default('À faire');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taches');
    }
};