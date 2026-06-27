<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Chaque jour à 00h01 : vérifie les congés qui débutent ou se terminent et envoie les notifications
Schedule::command('leaves:check')->dailyAt('00:01');
