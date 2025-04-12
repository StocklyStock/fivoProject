import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';

export default function ChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 모달 여는 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
      >
        💬 챗봇
      </button>

      {/* 모달 전체 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 백그라운드 오버레이 */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 모달 박스 */}
            <motion.div
              className="fixed bottom-16 right-6 z-50 w-[90vw] max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* 상단바 */}
              <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-100">
                <h2 className="text-lg font-semibold">Fivo 챗봇</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">
                  ✖
                </button>
              </div>

              {/* 챗봇 본체 */}
              <div className="p-4 h-[70vh] overflow-y-auto bg-gray-50">
                <Chatbot />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}