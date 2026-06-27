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
        Schema::table('taches', function (Blueprint $table) {
            $table->index('statut');
            $table->index('created_at');
            $table->index('user_id');
        });

        Schema::table('demandes_conge', function (Blueprint $table) {
            $table->index('statut');
            $table->index('created_at');
            $table->index('user_id');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->index('statut');
            $table->index('created_at');
            $table->index('user_id');
            $table->index('technicien_id');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['destinataire_id', 'lu']);
            $table->index('created_at');
        });

        Schema::table('audits', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taches', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('demandes_conge', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['statut']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id']);
            $table->dropIndex(['technicien_id']);
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['destinataire_id', 'lu']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('audits', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};
