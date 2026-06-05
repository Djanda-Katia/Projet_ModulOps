<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('tickets', function (Blueprint $table) {
        $table->id();
        // Celui qui a le problème (Employé ou Responsable)
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        
        // Celui qui va réparer (Le Technicien) - peut être vide au début
        $table->foreignId('technicien_id')->nullable()->constrained('users')->onDelete('set null');
        
        $table->string('objet');
        $table->text('description');
        $table->string('priorite')->default('Normale'); // Faible, Normale, Urgente
        $table->string('statut')->default('Ouvert'); // Ouvert, En cours, Résolu, Fermé
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
