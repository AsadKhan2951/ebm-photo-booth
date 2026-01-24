"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ScreenCard from "../../components/ScreenCard";
import { GhostButton, PrimaryButton } from "../../components/Button";
import { useBooth } from "../../context/BoothContext";

function printImage(dataUrl) {
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
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
          img { width: 100%; height: 100%; object-fit: contain; display: block; }
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

  const cleanup = () => iframe.remove();
  const triggerPrint = () => {
    const w = iframe.contentWindow;
    if (!w) return;
    w.focus();
    w.print();
  };

  const img = doc.getElementById("print-img");
  if (img) {
    img.onload = triggerPrint;
    img.onerror = cleanup;
  } else {
    triggerPrint();
  }

  iframe.contentWindow?.addEventListener("afterprint", cleanup);
}

export default function Screen6() {
  const router = useRouter();
  const { state, resetAll } = useBooth();
  const [toast, setToast] = useState("");

  const finalImg = useMemo(() => state.enhanced || (state.selectedIndex != null ? state.shots?.[state.selectedIndex] : null), [state]);

  useEffect(() => {
    if (!finalImg) router.replace("/previews");
  }, [finalImg, router]);

  const fakeEmailSend = async () => {
    // Placeholder: yahan backend API laga ke real email send karoge.
    setToast("Email queued (demo). Backend add karo to real email jayegi.");
    setTimeout(() => setToast(""), 2500);
  };

  const onPrint = () => finalImg && printImage(finalImg);
  const onEmail = () => fakeEmailSend();
  const onBoth = async () => {
    onPrint();
    await fakeEmailSend();
  };

  return (
    <ScreenCard
      screen={7}
      heading="SAVE PHOTO"
      subheading="Choose output method"
      footer={
        <div className="space-y-3">
          <GhostButton onClick={() => router.push("/enhance")}>BACK</GhostButton>
          <button
            type="button"
            onClick={() => { resetAll(); router.push("/"); }}
            className="w-full text-xs text-slate-500 hover:text-slate-700"
          >
            Start new session
          </button>
        </div>
      }
    >
      <div className="px-6 pb-6">
        <div className="rounded-3xl border-2 border-slate-300 bg-white p-3">
          {finalImg ? (
            <img src={finalImg} alt="Final" className="w-full aspect-[3/4] object-cover rounded-2xl" />
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          <button type="button" onClick={onPrint} className="k-btn k-btn-ghost">
            🖨️ PRINT PHOTO
          </button>
          <button type="button" onClick={onEmail} className="k-btn k-btn-ghost">
            📧 EMAIL PHOTO
          </button>
          <PrimaryButton onClick={onBoth}>
            🖨️ + 📧 PRINT & EMAIL
          </PrimaryButton>
        </div>

        {toast ? (
          <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {toast}
          </div>
        ) : null}
      </div>
    </ScreenCard>
  );
}
