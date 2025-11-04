<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImportController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/', function () {
    return view('public.map');
})->name('home');

Route::get('/statistics', function () {
    return view('public.statistics');
})->name('public.statistics');

// Admin routes (require authentication and role)
Route::middleware(['auth', 'role:admin,moderator'])->prefix('admin')->group(function () {
    Route::get('/import', [ImportController::class, 'index'])->name('admin.import');
    Route::post('/import/upload', [ImportController::class, 'upload'])->name('admin.import.upload');
    Route::get('/import/download-errors', [ImportController::class, 'downloadErrors'])->name('admin.import.download-errors');
});
