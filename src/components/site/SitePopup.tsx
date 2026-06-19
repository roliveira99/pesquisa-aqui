"use client";

import { useEffect, useState } from "react";

interface PopupAnnouncement {
  id: string;
  title: string;
  message: string;
  linkUrl?: string;
  linkLabel?: string;
  mediaUrl?: string;
  style: string;
}

export function SitePopup() {
  const [items, setItems] = useState<PopupAnnouncement[]>([]);
  const [visible, setVisible] = useState<PopupAnnouncement | null>(null);

  useEffect(() => {
    void fetch("/api/platform?displayType=modal")
      .then((r) => r.json())
      .then((data: { announcements: PopupAnnouncement[] }) => {
        const modals = data.announcements.filter((a) => a);
        const unseen = modals.find((a) => !sessionStorage.getItem(`popup-${a.id}`));
        setItems(modals);
        if (unseen) setVisible(unseen);
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  function dismiss() {
    sessionStorage.setItem(`popup-${visible!.id}`, "1");
    const next = items.find((a) => a.id !== visible!.id && !sessionStorage.getItem(`popup-${a.id}`));
    setVisible(next ?? null);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="card max-w-lg w-full overflow-hidden shadow-2xl">
        {visible.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={visible.mediaUrl} alt="" className="max-h-48 w-full object-cover" />
        )}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-foreground">{visible.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{visible.message}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {visible.linkUrl && (
              <a href={visible.linkUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm">
                {visible.linkLabel ?? "Saiba mais"}
              </a>
            )}
            <button type="button" onClick={dismiss} className="btn btn-secondary text-sm">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
