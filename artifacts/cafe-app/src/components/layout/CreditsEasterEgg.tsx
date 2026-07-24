import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const CREDITS = ["Naza", "Shisi", "Pandu", "Rasya", "Kia", "Nazwa"];

export function useCreditsEasterEgg() {
  const [clickCount, setClickCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [lastClick, setLastClick] = useState(0);

  const registerClick = () => {
    const now = Date.now();
    // reset streak if the clicks are too slow (more than 600ms apart)
    const withinWindow = now - lastClick < 600;
    setLastClick(now);

    setClickCount((prev) => {
      const next = withinWindow ? prev + 1 : 1;
      if (next >= 5) {
        setOpen(true);
        return 0;
      }
      return next;
    });
  };

  return { open, setOpen, registerClick };
}

export function CreditsEasterEgg({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 pt-6 pb-8 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Easter Egg Ditemukan!</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Dibuat oleh</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Tim kecil di balik Lubertu Coffee ✨
              </p>

              <ul className="space-y-2.5">
                {CREDITS.map((name, i) => (
                  <motion.li
                    key={name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3"
                  >
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-base">{name}</span>
                  </motion.li>
                ))}
              </ul>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Terima kasih sudah menemukan rahasia kecil ini 👋
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
