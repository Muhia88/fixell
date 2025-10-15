import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
          >
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            <div>{children}</div>
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
