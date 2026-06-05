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
    Schema::create('demandes_conge', function (Blueprint $table) {
        $table->id();
        // On lie la demande à l'utilisateur (l'employé)
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        
        $table->date('date_debut');
        $table->date('date_fin');
        $table->string('type_conge'); // Ex: Annuel, Maladie, Exceptionnel
        $table->text('motif')->nullable();
        
        // Le statut par défaut est toujours 'En attente'
        $table->string('statut')->default('En attente'); 
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_conge');
    }
};
