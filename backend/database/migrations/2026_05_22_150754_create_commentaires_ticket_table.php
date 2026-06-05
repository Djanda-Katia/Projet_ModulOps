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
    Schema::create('commentaires_ticket', function (Blueprint $table) {
        $table->id();
        $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
        $table->foreignId('auteur_id')->constrained('users')->onDelete('cascade');
        $table->text('contenu');
        $table->timestamp('date')->useCurrent();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commentaires_ticket');
    }
};
