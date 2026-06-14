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

            // CORRECTION : renommé 'objet' → 'titre' pour s'aligner avec le TicketController
            $table->string('titre');

            $table->text('description');

            // CORRECTION : ajout de 'categorie' utilisé dans TicketController@store
            $table->string('categorie');

            // CORRECTION : valeurs alignées avec le TicketController (Haute, Moyenne, Basse)
            $table->string('priorite')->default('Basse');

            // Statut : Ouvert → En cours → Résolu → Fermé
            $table->string('statut')->default('Ouvert');

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