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
  const [activeField, setActiveField] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

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

  const openKeyboard = (field) => {
    setActiveField(field);
    setKeyboardOpen(true);
    setError("");
  };

  const closeKeyboard = () => {
    setKeyboardOpen(false);
    setActiveField(null);
  };

  const applyKey = (key) => {
    if (!activeField) return;
    setForm((prev) => {
      const current = String(prev[activeField] ?? "");
      let next = current;
      if (key === "Backspace") {
        next = current.slice(0, -1);
      } else if (key === "Clear") {
        next = "";
      } else if (key === "Space") {
        next = `${current} `;
      } else if (key === "Done") {
        return prev;
      } else {
        next = current + key;
      }
      return { ...prev, [activeField]: next };
    });
    if (key === "Done") closeKeyboard();
  };

  const isNumeric = activeField === "age" || activeField === "phone";
  const isEmail = activeField === "email";
  const alphaRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
  ];
  const emailRow = ["@", ".", "-", "_"];
  const numericRows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]
  ];

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
                  onFocus={() => openKeyboard("name")}
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
                  onFocus={() => openKeyboard("age")}
                />
              </label>

              <label className="text-white font-bold tracking-wide text-[clamp(11px,1.8vw,16px)]">
                EMAIL ADDRESS
                <input
                  className="mt-1 w-full rounded-[12px] border-[2.5px] border-white bg-transparent px-4 text-white outline-none"
                  style={{ height: "clamp(30px, 5.4vw, 46px)" }}
                  value={form.email}
                  onChange={(e) => { setError(""); setForm((s) => ({ ...s, email: e.target.value })); }}
                  onFocus={() => openKeyboard("email")}
                />
              </label>

              <label className="text-white font-bold tracking-wide text-[clamp(11px,1.8vw,16px)]">
                CONTACT NUMBER
                <input
                  className="mt-1 w-full rounded-[12px] border-[2.5px] border-white bg-transparent px-4 text-white outline-none"
                  style={{ height: "clamp(30px, 5.4vw, 46px)" }}
                  value={form.phone}
                  onChange={(e) => { setError(""); setForm((s) => ({ ...s, phone: e.target.value })); }}
                  onFocus={() => openKeyboard("phone")}
                />
              </label>
            </div>

            <div
              className={`mt-5 w-[30%] transition-opacity ${keyboardOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            >
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

          {keyboardOpen ? (
            <div className="absolute left-1/2 bottom-[6%] w-[92%] -translate-x-1/2 rounded-[18px] border-[2px] border-white/40 bg-[#0a3e9e]/95 p-3 text-white shadow-[0_18px_30px_rgba(0,0,0,0.35)]">
              <div className="mb-2 flex items-center justify-between text-[12px] font-semibold tracking-wide">
                <div className="uppercase">
                  {activeField ? `${activeField} input` : "Keyboard"}
                </div>
                <button
                  type="button"
                  onClick={() => applyKey("Done")}
                  className="rounded-lg bg-white/90 px-3 py-1 text-[#0b4bc0]"
                >
                  Done
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {(isNumeric ? numericRows : alphaRows).map((row) => (
                  <div key={row.join("")} className="flex justify-center gap-2">
                    {row.map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyKey(key)}
                        className="min-w-[32px] flex-1 rounded-xl bg-white/10 px-2 py-2 text-sm font-bold"
                      >
                        {key}
                      </button>
                    ))}
                    {row === alphaRows[alphaRows.length - 1] && (
                      <button
                        type="button"
                        onClick={() => applyKey("Backspace")}
                        className="min-w-[52px] rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
                      >
                        ⌫
                      </button>
                    )}
                    {isNumeric && row === numericRows[0] && (
                      <button
                        type="button"
                        onClick={() => applyKey("Backspace")}
                        className="min-w-[52px] rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
                      >
                        ⌫
                      </button>
                    )}
                  </div>
                ))}

                {!isNumeric && (
                  <div className="flex justify-center gap-2">
                    {(isEmail ? emailRow : ["Space"]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyKey(key === "Space" ? "Space" : key)}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
                        style={{ minWidth: key === "Space" ? "160px" : "48px" }}
                      >
                        {key === "Space" ? "Space" : key}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => applyKey("Clear")}
                      className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {isNumeric && (
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => applyKey("Clear")}
                      className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => applyKey("Done")}
                      className="rounded-xl bg-white/90 px-4 py-2 text-sm font-bold text-[#0b4bc0]"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

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
