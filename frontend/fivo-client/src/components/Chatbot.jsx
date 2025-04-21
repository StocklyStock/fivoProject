import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState('');
  const chatEndRef = useRef(null);
  const isAuthenticated = useSelector((state) => state.auth.user !== null); // ✅ 로그인 여부
  const navigate = useNavigate();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const typeEffect = (text = '', callback) => {
    let index = 0;
    setTyping('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setTyping((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        callback();
      }
    }, 25);
  };

  const handleSubmit = async (customMessage = null) => {
    const content = customMessage ?? message;
    if (!content.trim()) return;

    const userMessage = { sender: 'user', text: content };
    setMessages((prev) => [...prev, userMessage]);
    setTyping('🤖');
    setLoading(true);
    setMessage('');

    // ✅ 예측 키워드 확인 및 로그인 체크
    const lower = content.toLowerCase();
    const hasPredictionKeyword = ["예측", "추천", "분석"].some(keyword => lower.includes(keyword));

    if (!isAuthenticated && hasPredictionKeyword) {
      const botText = "🔒 예측/추천 기능은 로그인 후 사용 가능합니다.\n\n👉 로그인하시려면 여기를 클릭해주세요.";
      setTyping('');
      setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const res = await fetch('http://localhost:8080/api/chatbot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
        credentials: 'include',
      });
      const data = await res.json();

      let botResponse = data.response;

      if (data.interpretation) {
        botResponse += `\n\n📊 해석: ${data.interpretation}`;
      }

      if (data.summary) {
        botResponse += `\n\n📝 요약: ${data.summary}`;
      }

      if (data.suggestions && data.suggestions.length > 0) {
        const suggestionText = data.suggestions
          .map((s, i) => `${i + 1}. ${s}`)
          .join('\n');
        botResponse += `\n\n💡 혹시 다음 종목 중에 해당되나요?\n${suggestionText}`;
      }

      typeEffect(botResponse, () => {
        setMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
        setTyping('');
      });
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: '서버 오류가 발생했어요.' }]);
      setTyping('');
    } finally {
      setLoading(false);
    }
  };

  const handleUsageClick = () => {
    setMessage('사용법');
    handleSubmit('사용법');
  };

  const handleClearChat = async () => {
    setMessages([]);
    setTyping('');
    localStorage.removeItem('chatMessages');
    try {
      await fetch('http://localhost:8080/api/chatbot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: '초기화' }),
        credentials: 'include',
      });
    } catch (e) {
      console.error("세션 초기화 실패:", e);
    }
  };

  return (
    <>
      <Card className="chat-bot-menus">
        <CardContent>
          <Button onClick={handleUsageClick}>
            Fivo의 사용법
          </Button>
          <Button onClick={handleClearChat}>
            💬 대화 초기화
          </Button>
        </CardContent>
      </Card>

      <Card className="chat-area h-80 overflow-y-auto mb-4">
        <CardContent className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-xs break-words whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white user-chat'
                    : 'bg-gray-200 text-black bot-chat'
                }`}
              >
                {msg.text.includes('로그인하시려면') ? (
                  <span>
                    🔒 예측/추천 기능은 로그인 후 사용 가능합니다.  
                    <br />
                    👉 <span className="text-blue-600 underline cursor-pointer" onClick={() => navigate("/login")}>
                      로그인 바로가기
                    </span>
                  </span>
                ) : msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl max-w-xs break-words whitespace-pre-line bg-gray-200 text-black animate-pulse">
                {typing}
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="메시지를 입력하세요"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button type="submit" disabled={loading} className="text-white">
          <FontAwesomeIcon icon={faPaperPlane} />
        </Button>
      </form>
    </>
  );
}
