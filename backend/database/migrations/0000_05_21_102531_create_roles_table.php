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
        Schema::create('roles', function (Blueprint $table) {
            $table->id(); // L'identifiant unique (clé primaire)
            $table->string('libelle'); // Pour stocker "Admin", "Technicien", etc.
            $table->text('description')->nullable(); // Pour expliquer le rôle
            $table->timestamps(); // Pour enregistrer la date de création automatiquement
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
