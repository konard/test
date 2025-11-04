<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/region-stats', [ApiController::class, 'regionStats']);
Route::get('/statistics', [ApiController::class, 'statistics']);

// Admin only
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/clear-cache', [ApiController::class, 'clearCache']);
});
