<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:100',
            'isSampad' => 'sometimes|boolean',
            'national_code' => 'required|digits:10|unique:users,national_code',
            'phone' => ['required', 'regex:/^(09)\\d{9}$/', 'unique:users,phone'],
        ];

        $messages = [
            'name.required' => 'لطفاً نام خود را وارد کنید.',
            'name.max' => 'نام نباید بیشتر از 100 کاراکتر باشد.',
            'national_code.required' => 'کد ملی الزامی است.',
            'national_code.digits' => 'کد ملی باید 10 رقم باشد.',
            'national_code.unique' => 'این کد ملی قبلاً ثبت شده است.',
            'phone.required' => 'شماره تلفن الزامی است.',
            'phone.regex' => 'شماره تلفن معتبر نیست. مثلاً 09123456789',
            'phone.unique' => 'این شماره تلفن قبلاً ثبت شده است.',
        ];

        $data = $request->validate($rules, $messages);

        $user = User::create([
            'name' => $data['name'],
            'is_sampad' => $request->boolean('isSampad'),
            'national_code' => $data['national_code'],
            'phone' => $data['phone'],
        ]);
        $amount = $user->is_sampad ? 50000 : 100000;

        $payment = [
            'amount' => $amount,
            'card' => '6037 1234 5678 9012',
            'owner' => "امیررضا ریاحی",
            'message' => $user->is_sampad
                ? 'لطفاً مبلغ ۵۰۰،۰۰۰ تومان را به شماره کارت زیر واریز کنید.'
                : 'لطفاً مبلغ ۱،۰۰۰،۰۰۰ تومان را به شماره کارت زیر واریز کنید.'
        ];

        return response()->json(['id' => $user->id, 'payment' => $payment], 201);
    }
}