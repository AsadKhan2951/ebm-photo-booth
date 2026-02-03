"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooth } from "../../context/BoothContext";

const BG_URL = "/assets/Your%20Character/BG.png";
const IMG = {
  header: "/assets/Your%20Character/Header.png",
  title: "/assets/Your%20Character/Your-Super-Character!.png",
  tryAnother: "/assets/Your%20Character/Try-Another-New.png",
  perfect: "/assets/Your%20Character/This-is-Perfect-New.png"
};

const CHARACTER_POSES = {
  migu: {
    female: [
      "/assets/Migu/migu-female-1.png",
      "/assets/Migu/migu-female-2.png",
      "/assets/Migu/migu-female-4.png"
    ],
    male: [
      "/assets/Migu/migu-male-3.png",
      "/assets/Migu/migu-male-6.png"
    ]
  },
  teddy: {
    female: [
      "/assets/Teddy/teddy-female-1.png",
      "/assets/Teddy/teddy-female-2.png",
      "/assets/Teddy/teddy-female-3.png",
      "/assets/Teddy/teddy-female-4.png",
      "/assets/Teddy/teddy-female-6.png",
      "/assets/Teddy/teddy-female-7.png"
    ],
    male: [
      "/assets/Teddy/teddy-male-8.png"
    ]
  },
  pipper: {
    female: [
      "/assets/Pipper/pipper-female-3.png",
      "/assets/Pipper/pipper-female-4.png",
      "/assets/Pipper/pipper-female-5.png",
      "/assets/Pipper/pipper-female-6.png"
    ],
    male: [
      "/assets/Pipper/pipper-male-1.png",
      "/assets/Pipper/pipper-male-2.png"
    ]
  }
};

const FALLBACK_POSE = {
  migu: "/assets/Migu/migu-female-1.png",
  teddy: "/assets/Teddy/teddy-female-1.png",
  pipper: "/assets/Pipper/pipper-female-3.png"
};

const DISPLAY_LAYOUT = {
  migu: { top: 25, width: 74 },
  teddy: { top: 25, width: 62 },
  pipper: { top: 35, width: 44 },
  default: { top: 35, width: 74 }
};

function pickRandomPose(poseList, storageKey) {
  if (!poseList.length) return "";
  if (poseList.length === 1 || typeof window === "undefined") return poseList[0];

  const lastPose = localStorage.getItem(storageKey) || "";
  let nextPose = poseList[Math.floor(Math.random() * poseList.length)];

  if (nextPose === lastPose) {
    const alternatives = poseList.filter((pose) => pose !== lastPose);
    if (alternatives.length) {
      nextPose = alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }

  localStorage.setItem(storageKey, nextPose);
  return nextPose;
}

export default function YourCharacterScreen() {
  const router = useRouter();
  const { state, setComposite } = useBooth();
  const characterId = state.character?.id;
  const gender = state.user?.gender === "male" ? "male" : "female";
  const [selectedPose, setSelectedPose] = useState("");
  const setCompositeRef = useRef(setComposite);

  const poseList = useMemo(() => {
    const characterPoses = CHARACTER_POSES[characterId] || CHARACTER_POSES.migu;
    if (characterPoses[gender]?.length) return characterPoses[gender];
    if (characterPoses.female?.length) return characterPoses.female;
    return characterPoses.male || [];
  }, [characterId, gender]);

  const displayLayout = DISPLAY_LAYOUT[characterId] || DISPLAY_LAYOUT.default;

  useEffect(() => {
    setCompositeRef.current = setComposite;
  }, [setComposite]);

  useEffect(() => {
    if (!state.character) {
      router.replace("/character");
      return;
    }
    if (!state.shots?.length) {
      router.replace("/capture");
    }
  }, [state.character, state.shots, router]);

  useEffect(() => {
    if (!state.shots?.length || !characterId) return;
    const storageKey = `kids_photo_booth_pose_${characterId}_${gender}`;
    const picked = pickRandomPose(poseList, storageKey);
    const finalPose = picked || FALLBACK_POSE[characterId] || FALLBACK_POSE.migu;
    setSelectedPose(finalPose);
    setCompositeRef.current(finalPose);
  }, [state.shots, characterId, gender, poseList]);

  return (
    <div className="min-h-screen w-full bg-[#0b2d64] flex items-center justify-center px-4 py-6 kids-font">
      <div className="relative w-full max-w-[520px] aspect-[9/16] overflow-hidden rounded-[32px] shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />

        <img
          src={IMG.header}
          alt=""
          className="absolute left-0 top-0 w-full h-auto"
          draggable="false"
        />

        <img
          src={IMG.title}
          alt="Your Super Character!"
          className="absolute left-1/2 top-[27%] w-[95%] -translate-x-1/2"
          draggable="false"
        />

        <img
          src={selectedPose || FALLBACK_POSE[characterId] || FALLBACK_POSE.migu}
          alt="Character"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: `${displayLayout.top}%`, width: `${displayLayout.width}%` }}
          draggable="false"
        />

        <div className="absolute left-1/2 bottom-[7%] w-[90%] -translate-x-1/2 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/capture")}
            className="w-[47%] transition-transform active:scale-[0.98] hover:scale-[1.03]"
            aria-label="Try another photo"
          >
            <img src={IMG.tryAnother} alt="Try another photo" className="w-full h-auto" draggable="false" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/your-creation")}
            className="w-[43%] transition-transform active:scale-[0.98] hover:scale-[1.03]"
            aria-label="This is perfect"
          >
            <img src={IMG.perfect} alt="This is perfect" className="w-full h-auto" draggable="false" />
          </button>
        </div>
      </div>
    </div>
  );
}
