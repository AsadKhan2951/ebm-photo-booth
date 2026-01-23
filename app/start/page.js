"use client";

import { useRouter } from "next/navigation";
import { useBooth } from "../../context/BoothContext";
import { useMemo, useState } from "react";

const BG_URL = "/assets/Start%20Screen/Started-Screen.jpg";
const IMG = {
  button: "/assets/Start%20Screen/Select.png"
};

export default function StartScreen() {
  const router = useRouter();
  const { state, setUser, resetAll } = useBooth();
  const [form, setForm] = useState(state.user);
  const [error, setError] = useState("");

  const valid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!String(form.age).trim()) return false;
    const ageNum = Number(form.age);
    if (!Number.isFinite(ageNum) || ageNum <= 0) return false;
    if (!form.email.trim()) return false;
    // simple email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return false;
    return true;
  }, [form]);

  const onNext = () => {
    if (!valid) {
      setError("Please complete all fields to continue.");
      return;
    }
    setError("");
    setUser(form);
    router.push("/character");
  };

  return (
    <div className="min-h-screen w-full bg-[#0b4bc0] flex items-center justify-center px-4 py-6 kids-font">
      <div className="relative w-full max-w-[520px] aspect-[9/16] overflow-hidden rounded-[32px] shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />

        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-[18%] bottom-[24%] -translate-x-1/2 w-[72%] flex flex-col items-center">
            <div className="text-center">
              <div className="text-white font-extrabold tracking-wide text-[clamp(20px,3.6vw,34px)]">
                ENTER DETAILS
              </div>
              <div className="text-[#f7c640] font-semibold text-[clamp(12px,2.4vw,20px)]">
                Fill in your information
              </div>
            </div>

            <div
              className="w-full flex flex-col"
              style={{ gap: "clamp(6px, 1.8vw, 14px)" }}
            >
              <label className="text-white font-bold tracking-wide text-[clamp(11px,1.8vw,16px)]">
                NAME
                <input
                  className="mt-1 w-full rounded-[12px] border-[2.5px] border-white bg-transparent px-4 text-white outline-none"
                  style={{ height: "clamp(30px, 5.4vw, 46px)" }}
                  value={form.name}
                  onChange={(e) => { setError(""); setForm((s) => ({ ...s, name: e.target.value })); }}
                />
              </label>

              <label className="text-white font-bold tracking-wide text-[clamp(11px,1.8vw,16px)]">
                AGE
                <input
                  className="mt-1 w-full rounded-[12px] border-[2.5px] border-white bg-transparent px-4 text-white outline-none"
                  style={{ height: "clamp(30px, 5.4vw, 46px)" }}
                  inputMode="numeric"
                  value={form.age}
                  onChange={(e) => { setError(""); setForm((s) => ({ ...s, age: e.target.value })); }}
                />
              </label>

              <label className="text-white font-bold tracking-wide text-[clamp(11px,1.8vw,16px)]">
                EMAIL ADDRESS
                <input
                  className="mt-1 w-full rounded-[12px] border-[2.5px] border-white bg-transparent px-4 text-white outline-none"
                  style={{ height: "clamp(30px, 5.4vw, 46px)" }}
                  value={form.email}
                  onChange={(e) => { setError(""); setForm((s) => ({ ...s, email: e.target.value })); }}
                />
              </label>

              <label className="text-white font-bold tracking-wide text-[clamp(11px,1.8vw,16px)]">
                CONTACT NUMBER
                <input
                  className="mt-1 w-full rounded-[12px] border-[2.5px] border-white bg-transparent px-4 text-white outline-none"
                  style={{ height: "clamp(30px, 5.4vw, 46px)" }}
                  value={form.phone}
                  onChange={(e) => { setError(""); setForm((s) => ({ ...s, phone: e.target.value })); }}
                />
              </label>
            </div>

            <div className="mt-5 w-[30%]">
              <button
                type="button"
                onClick={onNext}
                className="w-full transition-transform active:scale-[0.98] hover:scale-[1.02]"
                aria-label="Next"
              >
                <img src={IMG.button} alt="" className="w-full h-auto" draggable="false" />
              </button>
              {error ? (
                <div className="mt-2 text-center text-sm font-semibold text-white drop-shadow-sm">
                  {error}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="absolute right-[4%] top-[4%] text-[0px]"
            aria-label="Reset session"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
