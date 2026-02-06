"use client";

import { useRouter } from "next/navigation";
import { useBooth } from "../context/BoothContext";

const BG_URL = "/assets/Main%20Screen/BG.jpg";
const TOUCH_URL = "/assets/Main%20Screen/Touch%20Hand%20Screen.png";

export default function MainScreen() {
  const router = useRouter();
  const { resetAll } = useBooth();

  const onBegin = () => {
    resetAll();
    router.push("/start");
  };

  return (
    <div className="min-h-screen w-full bg-[#2a0b4f] flex items-center justify-center px-4 py-6 kids-font">
      <div className="relative w-full max-w-[520px] aspect-[9/16] overflow-hidden rounded-[32px] shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />

        <div className="absolute inset-0">
          <button
            type="button"
            onClick={onBegin}
            className="absolute left-1/2 top-1/2 h-[100%] w-[78%] -translate-x-1/2 -translate-y-1/2 bg-transparent"
            aria-label="Start"
          >
            <span className="sr-only">Start</span>
            <img
              src={TOUCH_URL}
              alt=""
              className="h-full w-full object-contain"
              draggable="false"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
