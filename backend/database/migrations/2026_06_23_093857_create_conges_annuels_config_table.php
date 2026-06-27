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
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE users ALTER COLUMN periode_conges_annuels TYPE json USING periode_conges_annuels::json');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Si on annule, on revient à une colonne texte simple
            $table->string('periode_conges_annuels')->nullable()->change();
        });
    }
};