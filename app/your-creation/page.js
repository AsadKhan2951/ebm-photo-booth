"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooth } from "../../context/BoothContext";

const BG_URL = "/assets/Your%20Creation/Your-Creation-BG.jpg";
const PRINT_BG_URL = "/assets/Print%20Screen/Print-Screen.jpg.jpeg";
const IMG = {
  character: "/assets/Your%20Creation/Character.png",
  print: "/assets/Your%20Creation/3.png",
  email: "/assets/Your%20Creation/2.png",
  both: "/assets/Your%20Creation/1.png",
  heartLeft: "/assets/Your%20Creation/Heart-Left.png",
  heartRight: "/assets/Your%20Creation/Heart-Right.png",
  star: "/assets/Your%20Creation/Star.png",
  labelShape: "/assets/Your%20Creation/shape.png"
};
const LABELS = {
  migu: "/assets/Your%20Creation/MIGU.png",
  teddy: "/assets/Your%20Creation/TEDDY.png",
  pipper: "/assets/Your%20Creation/PIPER.png"
};
const CARD_THEME = {
  migu: { bg: "linear-gradient(180deg, #1d72ff 0%, #0f53cc 100%)" },
  teddy: { bg: "linear-gradient(180deg, #f1943b 0%, #c86a1d 100%)" },
  pipper: { bg: "linear-gradient(180deg, #ffd25a 0%, #f1a52b 100%)" },
  default: { bg: "linear-gradient(180deg, #1d72ff 0%, #0f53cc 100%)" }
};
const UI_CARD_IMAGE = {
  migu: { top: 28, width: 84 },
  teddy: { top: 30, width: 76 },
  pipper: { top: 34, width: 50 },
  default: { top: 28, width: 84 }
};
const PRINT_CARD_IMAGE = {
  migu: { top: 28, width: 84 },
  teddy: { top: 30, width: 76 },
  pipper: { top: 32, width: 72 },
  default: { top: 28, width: 84 }
};
const STORAGE_KEY = "kids_photo_booth_v1";

export default function YourCreationScreen() {
  const router = useRouter();
  const { state, resetAll } = useBooth();
  const [toast, setToast] = useState("");
  const [printing, setPrinting] = useState(false);

  const finalImg = useMemo(() => {
    if (state.composite) return state.composite;
    if (state.enhanced) return state.enhanced;
    return state.shots?.[0] || null;
  }, [state.composite, state.enhanced, state.shots]);
  const characterId = state.character?.id || "migu";
  const labelImg = LABELS[characterId] || LABELS.migu;
  const cardTheme = CARD_THEME[characterId] || CARD_THEME.default;
  const cardImage = UI_CARD_IMAGE[characterId] || UI_CARD_IMAGE.default;

  useEffect(() => {
    if (!state.shots?.length) router.replace("/capture");
  }, [state.shots, router]);

  const finishSession = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
    resetAll();
    if (typeof window !== "undefined") {
      window.location.replace("/");
      return;
    }
    router.replace("/");
  };

  const sendEmail = async (imageData) => {
    const email = String(state.user?.email || "").trim();
    if (!email) {
      setToast("Email address missing. Please enter your email.");
      setTimeout(() => setToast(""), 2200);
      return false;
    }
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          imageData,
          subject: "Your Photo Booth Print",
          text: "Thanks for visiting! Your photo is attached."
        })
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setToast(payload.error || "Email failed. Please try again.");
        setTimeout(() => setToast(""), 2200);
        return false;
      }
      setToast("Email sent successfully.");
      setTimeout(() => setToast(""), 2200);
      return true;
    } catch (err) {
      console.warn("Email send failed", err);
      setToast("Email failed. Please try again.");
      setTimeout(() => setToast(""), 2200);
      return false;
    }
  };

  const savePrintRecord = async (dataUrl, action) => {
    try {
      await fetch("/api/prints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageData: dataUrl,
          action,
          characterId,
          user: state.user || null
        })
      });
    } catch (err) {
      console.warn("Failed to save print image", err);
    }
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const composePrintImage = async (dataUrl, selectedId) => {
    const [bgImg, photoImg, shapeImg, labelImgObj] = await Promise.all([
      loadImage(PRINT_BG_URL),
      loadImage(dataUrl),
      loadImage(IMG.labelShape),
      loadImage(LABELS[selectedId] || LABELS.migu)
    ]);
    const canvas = document.createElement("canvas");
    canvas.width = bgImg.width;
    canvas.height = bgImg.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const detectFrame = () => {
      const search = {
        x: Math.round(canvas.width * 0.04),
        y: Math.round(canvas.height * 0.18),
        w: Math.round(canvas.width * 0.6),
        h: Math.round(canvas.height * 0.45)
      };
      const data = ctx.getImageData(search.x, search.y, search.w, search.h).data;
      let minX = search.w;
      let minY = search.h;
      let maxX = 0;
      let maxY = 0;
      let found = false;
      for (let y = 0; y < search.h; y++) {
        for (let x = 0; x < search.w; x++) {
          const idx = (y * search.w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (r > 240 && g > 240 && b > 240 && a > 200) {
            found = true;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (!found) {
        return {
          x: Math.round(canvas.width * 0.0658),
          y: Math.round(canvas.height * 0.2444),
          w: Math.round(canvas.width * 0.509),
          h: Math.round(canvas.height * 0.3317)
        };
      }
      return {
        x: search.x + minX,
        y: search.y + minY,
        w: Math.max(1, maxX - minX + 1),
        h: Math.max(1, maxY - minY + 1)
      };
    };

    const detectInner = (frame) => {
      const data = ctx.getImageData(frame.x, frame.y, frame.w, frame.h).data;
      let minX = frame.w;
      let minY = frame.h;
      let maxX = 0;
      let maxY = 0;
      let found = false;
      for (let y = 0; y < frame.h; y++) {
        for (let x = 0; x < frame.w; x++) {
          const idx = (y * frame.w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (r > 200 && g > 150 && b < 120 && a > 200) {
            found = true;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (!found) {
        return {
          x: frame.x + frame.w * 0.1,
          y: frame.y + frame.h * 0.18,
          w: frame.w * 0.8,
          h: frame.h * 0.62
        };
      }
      return {
        x: frame.x + minX,
        y: frame.y + minY,
        w: Math.max(1, maxX - minX + 1),
        h: Math.max(1, maxY - minY + 1)
      };
    };

    const frame = detectFrame();
    const inner = detectInner(frame);
    const cx = frame.x + frame.w / 2;
    const cy = frame.y + frame.h / 2;
    const angle = (-6.5 * Math.PI) / 180;
    const offsetX = inner.x + inner.w / 2 - cx - frame.w * 0.015;
    const offsetY = inner.y + inner.h / 2 - cy;
    const scale = 0.9;

    const drawRoundedRect = (c, x, y, w, h, r) => {
      const radius = Math.min(r, w / 2, h / 2);
      c.beginPath();
      c.moveTo(x + radius, y);
      c.lineTo(x + w - radius, y);
      c.quadraticCurveTo(x + w, y, x + w, y + radius);
      c.lineTo(x + w, y + h - radius);
      c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      c.lineTo(x + radius, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - radius);
      c.lineTo(x, y + radius);
      c.quadraticCurveTo(x, y, x + radius, y);
      c.closePath();
    };

    const card = document.createElement("canvas");
    card.width = Math.round(inner.w);
    card.height = Math.round(inner.h);
    const cctx = card.getContext("2d");
    const theme = CARD_THEME[selectedId] || CARD_THEME.default;
    const borderSize = Math.max(6, Math.round(card.width * 0.035));
    const radius = Math.round(card.width * 0.08);
    const grad = cctx.createLinearGradient(0, 0, 0, card.height);
    if (theme.bg.includes("#f1")) {
      grad.addColorStop(0, "#ffd25a");
      grad.addColorStop(1, "#f1a52b");
    } else if (theme.bg.includes("#f1") || theme.bg.includes("#c8")) {
      grad.addColorStop(0, "#f1943b");
      grad.addColorStop(1, "#c86a1d");
    } else {
      grad.addColorStop(0, "#1d72ff");
      grad.addColorStop(1, "#0f53cc");
    }
    drawRoundedRect(cctx, 0, 0, card.width, card.height, radius);
    cctx.fillStyle = grad;
    cctx.fill();
    cctx.lineWidth = borderSize;
    cctx.strokeStyle = "#7b33ff";
    cctx.stroke();

    const shapeW = card.width * 0.6;
    const shapeH = (shapeImg.height / shapeImg.width) * shapeW;
    const shapeX = (card.width - shapeW) / 2;
    const shapeY = card.height * 0.06;
    cctx.drawImage(shapeImg, shapeX, shapeY, shapeW, shapeH);

    const labelW = shapeW * 0.66;
    const labelH = (labelImgObj.height / labelImgObj.width) * labelW;
    const labelX = (card.width - labelW) / 2;
    const labelY = shapeY + shapeH * 0.18;
    cctx.drawImage(labelImgObj, labelX, labelY, labelW, labelH);

    const cardImage = PRINT_CARD_IMAGE[selectedId] || PRINT_CARD_IMAGE.default;
    const charBoxTop = card.height * (cardImage.top / 100);
    const charBoxH = card.height * 0.86 - charBoxTop;
    const charBoxW = card.width * (cardImage.width / 100);
    const scaleChar = Math.min(
      charBoxW / photoImg.width,
      charBoxH / photoImg.height
    );
    const charW = photoImg.width * scaleChar;
    const charH = photoImg.height * scaleChar;
    const charX = (card.width - charW) / 2;
    const charY = charBoxTop + (charBoxH - charH) / 2;
    cctx.drawImage(photoImg, charX, charY, charW, charH);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.rect(-frame.w / 2, -frame.h / 2, frame.w, frame.h);
    ctx.clip();
    ctx.drawImage(
      card,
      -inner.w * scale / 2 + offsetX,
      -inner.h * scale / 2 + offsetY,
      inner.w * scale,
      inner.h * scale
    );
    ctx.restore();

    return canvas.toDataURL("image/png");
  };

  const printImage = (dataUrl) => new Promise((resolve) => {
    const originalTitle = document.title;
    document.title = "";
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      resolve();
      return;
    }

    doc.open();
    doc.write(`
      <!doctype html>
      <html>
        <head>
          <title></title>
          <style>
            @page { margin: 0; size: 5in 7in; }
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
            body { background: #0b2d64; }
            img { width: 100%; height: 100%; object-fit: contain; display: block; margin: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <img id="print-img" src="${dataUrl}" />
        </body>
      </html>
    `);
    doc.close();

    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      document.title = originalTitle;
      iframe.remove();
      resolve();
    };

    const triggerPrint = () => {
      const w = iframe.contentWindow;
      if (!w) {
        cleanup();
        return;
      }
      const onAfterPrint = () => cleanup();
      w.addEventListener("afterprint", onAfterPrint, { once: true });
      w.focus();
      w.print();
      setTimeout(cleanup, 6000);
    };

    const img = doc.getElementById("print-img");
    if (img) {
      img.onload = triggerPrint;
      img.onerror = cleanup;
    } else {
      triggerPrint();
    }
  });

  const onPrint = async () => {
    if (!finalImg || printing) return;
    setPrinting(true);
    try {
      const composed = await composePrintImage(finalImg, characterId);
      await savePrintRecord(composed, "print");
      await printImage(composed);
    } finally {
      setPrinting(false);
    }
    finishSession();
  };

  const onEmail = async () => {
    if (!finalImg || printing) return;
    setPrinting(true);
    try {
      const composed = await composePrintImage(finalImg, characterId);
      await savePrintRecord(composed, "email");
      const ok = await sendEmail(composed);
      if (ok) finishSession();
    } finally {
      setPrinting(false);
    }
  };

  const onBoth = async () => {
    if (!finalImg || printing) return;
    setPrinting(true);
    let composed = null;
    try {
      composed = await composePrintImage(finalImg, characterId);
      await savePrintRecord(composed, "print_email");
      await printImage(composed);
    } finally {
      setPrinting(false);
    }
    if (!composed) return;
    const ok = await sendEmail(composed);
    if (ok) finishSession();
  };

  return (
    <div className="min-h-screen w-full bg-[#0b2d64] flex items-center justify-center px-4 py-6 kids-font">
      <div className="relative w-full max-w-[520px] aspect-[9/16] overflow-hidden rounded-[32px] shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BG_URL})` }}
        />
        <img
          src={IMG.heartLeft}
          alt=""
          className="absolute left-[18%] top-[7%] w-[12%] h-auto"
          draggable="false"
        />
        <img
          src={IMG.star}
          alt=""
          className="absolute left-1/2 top-[5.5%] w-[10%] h-auto -translate-x-1/2"
          draggable="false"
        />
        <img
          src={IMG.heartRight}
          alt=""
          className="absolute right-[18%] top-[7%] w-[12%] h-auto"
          draggable="false"
        />

        <div className="absolute left-1/2 top-[14%] w-[66%] -translate-x-1/2">
          <div
            className="relative w-full aspect-[3/4] rounded-[28px] border-[6px] border-[#7b33ff] shadow-[0_18px_30px_rgba(0,0,0,0.28)]"
            style={{ background: cardTheme.bg }}
          >
            <div className="absolute left-1/2 top-[6%] w-[84%] -translate-x-1/2">
              <div className="relative w-full">
                <img src={IMG.labelShape} alt="" className="w-full h-auto" draggable="false" />
                <img
                  src={labelImg}
                  alt=""
                  className="absolute left-1/2 top-[18%] w-[74%] -translate-x-1/2"
                  draggable="false"
                />
              </div>
            </div>
            <img
              src={finalImg || IMG.character}
              alt="Character"
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: `${cardImage.top}%`, width: `${cardImage.width}%` }}
              draggable="false"
            />
          </div>
        </div>

        <div className="absolute left-1/2 bottom-[4%] w-[42%] -translate-x-1/2 flex flex-col items-center gap-[clamp(10px,2vh,16px)]">
          <button
            type="button"
            onClick={onPrint}
            className="w-full transition-transform active:scale-[0.98] hover:scale-[1.03]"
            aria-label="Print"
          >
            <img src={IMG.print} alt="Print" className="w-full h-auto" draggable="false" />
          </button>
          <button
            type="button"
            onClick={onEmail}
            className="w-full transition-transform active:scale-[0.98] hover:scale-[1.03]"
            aria-label="Email"
          >
            <img src={IMG.email} alt="Email" className="w-full h-auto" draggable="false" />
          </button>
          <button
            type="button"
            onClick={onBoth}
            className="w-[112%] transition-transform active:scale-[0.98] hover:scale-[1.03]"
            aria-label="Do both"
          >
            <img src={IMG.both} alt="Do both" className="w-full h-auto" draggable="false" />
          </button>
        </div>

        {toast ? (
          <div className="absolute left-1/2 bottom-[20%] -translate-x-1/2 rounded-xl bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700">
            {toast}
          </div>
        ) : null}
      </div>
    </div>
  );
}
