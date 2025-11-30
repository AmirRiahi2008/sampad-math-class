import "../../css/multistep.css";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MultiStepForm() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        isSampad: false,
        national_code: "",
        phone: "",
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [serverMessage, setServerMessage] = useState(null);

    function next() {
        const e = validateStep(step);
        if (Object.keys(e).length === 0) {
            setErrors({});
            setStep((s) => s + 1);
        } else setErrors(e);
    }

    function prev() {
        setStep((s) => Math.max(1, s - 1));
    }

    function validateStep(s) {
        const e = {};
        if (s === 1) {
            if (!form.name.trim()) e.name = "لطفاً نام خود را وارد کنید.";
            else if (form.name.length > 100)
                e.name = "نام نباید بیشتر از 100 کاراکتر باشد.";
        }
        if (s === 3) {
            if (!/^\d{10}$/.test(form.national_code))
                e.national_code = "کد ملی باید 10 رقم باشد.";
            if (!/^(09)\d{9}$/.test(form.phone))
                e.phone = "شماره تلفن معتبر نیست. مثلاً 09123456789";
        }
        return e;
    }

    function getCsrf() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta) return meta.getAttribute("content");
        const match = document.cookie.match(
            "(^|;)\\s*XSRF-TOKEN\\s*=\\s*([^;]+)"
        );
        return match ? decodeURIComponent(match[2]) : null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const eerrs = validateStep(3);
        if (Object.keys(eerrs).length) return setErrors(eerrs);
        setSubmitting(true);
        setErrors({});
        setServerMessage(null);
        try {
            const token = getCsrf();
            if (!token) {
                setErrors({
                    server: "توکن CSRF پیدا نشد — صفحه را رفرش کنید.",
                });
                setSubmitting(false);
                return;
            }
            const res = await fetch("/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": token,
                    Accept: "application/json",
                },
                body: JSON.stringify(form),
            });
            const text = await res.text().catch(() => null);
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }
            if (res.status === 422 && data?.errors) {
                const mapped = {};
                if (data.errors.name) mapped.name = data.errors.name[0];
                if (data.errors.national_code) {
                    const msg = data.errors.national_code[0];
                    if (/unique|تکراری|قبلا/i.test(msg))
                        mapped.national_code = "این کد ملی قبلاً ثبت شده است.";
                    else mapped.national_code = msg;
                }
                if (data.errors.phone) {
                    const msg = data.errors.phone[0];
                    if (/unique|تکراری|قبلا/i.test(msg))
                        mapped.phone = "این شماره تلفن قبلاً ثبت شده است.";
                    else mapped.phone = msg;
                }
                if (data.errors?.server) mapped.server = data.errors.server[0];
                setErrors(mapped);
                setSubmitting(false);
                return;
            }
            if (!res.ok) {
                const message = data?.message || `خطای سرور (${res.status})`;
                setErrors({ server: message });
                setSubmitting(false);
                return;
            }
            const payment = data?.payment || null;
            if (payment) {
                setPaymentInfo(payment);
            } else {
                const amount = form.isSampad ? 50000 : 100000;
                setPaymentInfo({
                    amount,
                    card: "6037 1234 5678 9012",
                    owner: "امیررضا ریاحی",
                    message: form.isSampad
                        ? "لطفاً مبلغ ۵۰,۰۰۰ تومان را به شماره کارت زیر واریز کنید."
                        : "لطفاً مبلغ ۱۰۰,۰۰۰ تومان را به شماره کارت زیر واریز کنید.",
                });
            }
            setServerMessage("ثبت اطلاعات با موفقیت انجام شد.");
        } catch (err) {
            setErrors({
                server: "خطا در اتصال به سرور — لطفاً اینترنت یا سرور را بررسی کنید.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    const cardVariants = {
        enter: { opacity: 0, scale: 0.96, y: 18, rotate: 2 },
        center: { opacity: 1, scale: 1, y: 0, rotate: 0 },
        exit: { opacity: 0, scale: 0.96, y: -18, rotate: -2 },
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 120 : -120,
            opacity: 0,
            rotate: direction > 0 ? 6 : -6,
        }),
        center: { x: 0, opacity: 1, rotate: 0 },
        exit: (direction) => ({
            x: direction > 0 ? -120 : 120,
            opacity: 0,
            rotate: direction > 0 ? -6 : 6,
        }),
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    {!paymentInfo ? (
                        <motion.div
                            key="form-card"
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.42, ease: "anticipate" }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10"
                        >
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                ثبت‌نام کلاس ریاضی به میزبانی دبیرستان تیزهوشان
                            </h2>

                            <div className="mb-6">
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        style={{
                                            width: `${(step / 3) * 100}%`,
                                        }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all"
                                    ></div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="space-y-6">
                                    <AnimatePresence custom={step} mode="wait">
                                        {step === 1 && (
                                            <motion.div
                                                key="s1"
                                                custom={1}
                                                variants={slideVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{
                                                    duration: 0.38,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-200">
                                                    نام کامل
                                                </label>
                                                <input
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="w-full p-3 rounded-lg border bg-transparent border-gray-200 dark:border-gray-700"
                                                    placeholder="مثال: امیررضا ریاحی"
                                                />
                                                {errors.name && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.name}
                                                    </p>
                                                )}
                                                <div className="flex justify-end mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={next}
                                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                                                    >
                                                        بعدی
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                key="s2"
                                                custom={1}
                                                variants={slideVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{
                                                    duration: 0.38,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <label className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.isSampad}
                                                        onChange={(e) =>
                                                            setForm({
                                                                ...form,
                                                                isSampad:
                                                                    e.target
                                                                        .checked,
                                                            })
                                                        }
                                                        className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-md flex-shrink-0 checked:bg-indigo-600 checked:border-indigo-600 transition-all"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-200">
                                                        در صورتی که از مدرسه
                                                        سمپاد ثبت نام می‌کنید
                                                        تیک را فعال کنید
                                                    </span>
                                                </label>

                                                <div className="flex justify-between gap-2 mt-6">
                                                    <button
                                                        type="button"
                                                        onClick={prev}
                                                        className="px-4 py-2 rounded-lg border"
                                                    >
                                                        قبلی
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={next}
                                                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                                                    >
                                                        بعدی
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                key="s3"
                                                custom={1}
                                                variants={slideVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{
                                                    duration: 0.38,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-200">
                                                    کد ملی
                                                </label>
                                                <input
                                                    value={form.national_code}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            national_code:
                                                                e.target.value.replace(
                                                                    /[^0-9]/g,
                                                                    ""
                                                                ),
                                                        })
                                                    }
                                                    maxLength={10}
                                                    className="w-full p-3 rounded-lg border bg-transparent border-gray-200 dark:border-gray-700"
                                                    placeholder="مثال: 0123456789"
                                                />
                                                {errors.national_code && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.national_code}
                                                    </p>
                                                )}

                                                <label className="block text-sm mt-4 mb-2 text-gray-700 dark:text-gray-200">
                                                    شماره تلفن
                                                </label>
                                                <input
                                                    value={form.phone}
                                                    onChange={(e) =>
                                                        setForm({
                                                            ...form,
                                                            phone: e.target.value.replace(
                                                                /[^0-9]/g,
                                                                ""
                                                            ),
                                                        })
                                                    }
                                                    maxLength={11}
                                                    className="w-full p-3 rounded-lg border bg-transparent border-gray-200 dark:border-gray-700"
                                                    placeholder="مثال: 09123456789"
                                                />
                                                {errors.phone && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.phone}
                                                    </p>
                                                )}

                                                {errors.server && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.server}
                                                    </p>
                                                )}
                                                {serverMessage && (
                                                    <p className="mt-2 text-sm text-green-500">
                                                        {serverMessage}
                                                    </p>
                                                )}

                                                <div className="flex justify-between gap-2 mt-6">
                                                    <button
                                                        type="button"
                                                        onClick={prev}
                                                        className="px-4 py-2 rounded-lg border"
                                                    >
                                                        قبلی
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={submitting}
                                                        className="px-4 py-2 rounded-lg bg-green-600 text-white"
                                                    >
                                                        {submitting
                                                            ? "در حال ارسال..."
                                                            : "ثبت و ارسال"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="payment-box"
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -20 }}
                            transition={{ duration: 0.42, ease: "easeOut" }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 text-center"
                        >
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                                راهنمای پرداخت
                            </h3>
                            <p className="mb-4 text-gray-700 dark:text-gray-200">
                                {paymentInfo.message ||
                                    (paymentInfo.amount === 50000
                                        ? "لطفاً مبلغ ۵۰,۰۰۰ تومان را واریز کنید."
                                        : "لطفاً مبلغ ۱۰۰,۰۰۰ تومان را واریز کنید.")}
                            </p>
                            <p class="mb-4 text-gray-700 dark:text-gray-200">
                                فیش واریزی را به همراه نام به شماره ۰۹۱۲۳۴۵۶۷۸
                                ارسال کنید
                            </p>
                            <div className="inline-block text-left bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-sm">
                                <div className="mb-2">
                                    {" "}
                                    <code className="bg-white/70 px-2 py-1 rounded card_number">
                                        {paymentInfo.card}
                                    </code>
                                </div>
                                <div className="mb-2 mt-3 text-center">
                                    <span className="font-medium">
                                        به نام کارت:
                                    </span>{" "}
                                    {paymentInfo.owner}
                                </div>

                                <a
                                    href="https://www.google.com"
                                    class="mt-4 px-8 py-2 
         bg-[#95a4e84f] 
         rounded-[10px] 
         flex items-center justify-center 
         transition-all duration-300 ease-in-out
         hover:bg-indigo-400/40 hover:backdrop-blur-sm hover:shadow-md"
                                >
                                    خروج
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
