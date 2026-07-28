import { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message, fading: false });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        fading: true,
      }));
    }, 3500);

    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* GLOBAL TOAST RENDER */}
      {toast && (
        <div className={`toast ${toast.type} ${toast.fading ? "fade-out" : ""}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);