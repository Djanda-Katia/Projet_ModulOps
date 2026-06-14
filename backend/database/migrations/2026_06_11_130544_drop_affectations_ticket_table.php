<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // CORRECTION : suppression réelle de la table inutilisée
    public function up(): void
    {
        Schema::dropIfExists('affectations_ticket');
    }

    public function down(): void
    {
        // Pas de rollback nécessaire, cette table n'est plus utilisée
    }
};