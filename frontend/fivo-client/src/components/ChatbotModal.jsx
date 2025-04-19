import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from './Chatbot';
import chatbotIcon from "../assets/chat-bot-icon.png"

export default function ChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 모달 여는 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="chat-bot-btn shadow-md transition"
      >
        <img src={chatbotIcon} alt='💬 챗봇' />
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
              className="chat-bot-box fixed z-50 flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {/* 상단바 */}
              <div className="chat-bot-headline flex justify-between items-center">
                <h2 className="text-lg font-semibold"><span>FIVO</span> 챗봇</h2>
                <button onClick={() => setIsOpen(false)}>
                  ✖
                </button>
              </div>

              {/* 챗봇 본체 */}
              <div className="chat-bot-body verflow-y-auto">
                <Chatbot />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}