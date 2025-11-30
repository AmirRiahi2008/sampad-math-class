<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get("/" , function(){
    return Inertia::render("MultiStepForm");
});
Route::post('/users', [UserController::class, 'store'])->name('users.store');
Route::get("/api/users" , [UserController::class , "index"]);
