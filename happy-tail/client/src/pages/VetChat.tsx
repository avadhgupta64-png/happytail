import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Loader2, Bot, User, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VET_SUGGESTIONS: Partial<Record<string, string[]>> = {
  en: ["My dog has been scratching a lot", "Is chocolate toxic for dogs?", "My puppy won't eat", "How often should I deworm?"],
  hi: ["मेरा कुत्ता बहुत खुजला रहा है", "क्या चॉकलेट कुत्तों के लिए जहरीली है?", "मेरा पिल्ला खाना नहीं खा रहा", "कृमिनाशक कितनी बार देना चाहिए?"],
  ta: ["என் நாய் அதிகமாக சொறிகிறது", "சாக்லேட் நாய்களுக்கு தீங்கானதா?", "என் குட்டி நாய் சாப்பிட மறுக்கிறது", "எவ்வளவு அடிக்கடி பூச்சி மருந்து கொடுக்கணும்?"],
  te: ["మా కుక్క చాలా గోకుతోంది", "చాక్లెట్ కుక్కలకు హాని కలిగిస్తుందా?", "మా పిల్ల కుక్క తినడం లేదు", "పురుగు మందు ఎంత తరచుగా ఇవ్వాలి?"],
  mr: ["माझा कुत्रा खूप खाजवत आहे", "चॉकलेट कुत्र्यांसाठी विषारी आहे का?", "माझा कुत्र्याचा पिल्लू खात नाही", "जंतनाशक किती वेळा द्यावे?"],
  bn: ["আমার কুকুর অনেক চুলকাচ্ছে", "চকোলেট কি কুকুরের জন্য বিষাক্ত?", "আমার কুকুরছানা খাচ্ছে না", "কৃমির ওষুধ কত ঘন ঘন দেব?"],
  gu: ["મારો કૂતરો ખૂબ ખંજવાળ કરે છે", "ચોકલેટ કૂતરા માટે ઝેરી છે?", "મારો ગલૂડિયો ખાતો નથી", "કૃમિ-નિયંત્રણ ક્યારે ક્યારે આપવું?"],
  kn: ["ನನ್ನ ನಾಯಿ ತುಂಬಾ ಕೆರೆದುಕೊಳ್ಳುತ್ತಿದೆ", "ಚಾಕೊಲೇಟ್ ನಾಯಿಗಳಿಗೆ ವಿಷಕಾರಿಯೇ?", "ನನ್ನ ನಾಯಿ ಮರಿ ತಿನ್ನುತ್ತಿಲ್ಲ", "ಕೃಮಿ ಔಷಧ ಎಷ್ಟು ಬಾರಿ ಕೊಡಬೇಕು?"],
  ml: ["എന്റെ നായ് വളരെ ചൊറിയുന്നു", "ചോക്ലേറ്റ് നായ്ക്കൾക്ക് വിഷമാണോ?", "എന്റെ കുഞ്ഞ് നായ് ഭക്ഷണം കഴിക്കുന്നില്ല", "വിരമരുന്ന് എത്ര തവണ കൊടുക്കണം?"],
  pa: ["ਮੇਰਾ ਕੁੱਤਾ ਬਹੁਤ ਖੁਰਕ ਰਿਹਾ ਹੈ", "ਕੀ ਚਾਕਲੇਟ ਕੁੱਤਿਆਂ ਲਈ ਜ਼ਹਿਰੀਲੀ ਹੈ?", "ਮੇਰਾ ਕੁੱਤੇ ਦਾ ਬੱਚਾ ਨਹੀਂ ਖਾ ਰਿਹਾ", "ਕਿੰਨੀ ਵਾਰ ਕੀੜੇ ਮਾਰਨ ਵਾਲੀ ਦਵਾਈ ਦੇਣੀ ਚਾਹੀਦੀ ਹੈ?"],
  es: ["Mi perro se rasca mucho", "¿Es el chocolate tóxico para los perros?", "Mi cachorro no quiere comer", "¿Con qué frecuencia debo desparasitar?"],
  fr: ["Mon chien se gratte beaucoup", "Le chocolat est-il toxique pour les chiens?", "Mon chiot ne mange pas", "À quelle fréquence devrais-je vermifuger?"],
  de: ["Mein Hund kratzt sich sehr viel", "Ist Schokolade giftig für Hunde?", "Mein Welpe frisst nicht", "Wie oft sollte ich entwurmen?"],
  ar: ["كلبي يحك كثيرًا", "هل الشوكولاتة سامة للكلاب؟", "جروي لا يأكل", "كم مرة يجب إعطاء دواء الديدان؟"],
  zh: ["我的狗一直在挠痒", "巧克力对狗有毒吗？", "我的小狗不吃东西", "多久驱虫一次？"],
  ja: ["犬がよく掻いています", "チョコレートは犬に有毒ですか？", "子犬が食べません", "駆虫はどのくらいの頻度でするべきですか？"],
  ko: ["강아지가 자꾸 긁어요", "초콜릿은 개에게 독성이 있나요?", "강아지가 밥을 안 먹어요", "구충제는 얼마나 자주 줘야 하나요?"],
  pt: ["Meu cachorro coça muito", "O chocolate é tóxico para cães?", "Meu filhote não quer comer", "Com que frequência devo vermifugar?"],
  ru: ["Моя собака много чешется", "Токсичен ли шоколад для собак?", "Мой щенок не ест", "Как часто нужно давать средство от глистов?"],
};

export default function VetChat() {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { checkGuestAccess } = useGuest();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    if (!checkGuestAccess()) return;

    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/health/vet-chat", {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        language: lang,
      });
      const data = await res.json();
      setMessages([...updatedMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...updatedMessages, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]" data-testid="vet-chat-page">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <Link href="/health">
          <Button variant="ghost" size="icon" data-testid="button-back-health">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-foreground" data-testid="text-chat-title">{t.vetChat.title}</h1>
            <p className="text-[11px] text-muted-foreground">{t.vetChat.subtitle}</p>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden p-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center px-6 py-12"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="font-bold text-foreground text-lg mb-2">{t.vetChat.title}</h2>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                {t.vetChat.subtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "My dog has been scratching a lot",
                  "Is chocolate toxic for dogs?",
                  "My puppy won't eat",
                  "How often should I deworm?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-xs bg-muted hover-elevate px-3 py-1.5 rounded-full text-muted-foreground transition-colors"
                    data-testid={`suggestion-${q.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-blue-500" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-md px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
                data-testid={`message-${msg.role}-${idx}`}
              >
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                ))}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="bg-muted rounded-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </motion.div>
          )}
        </div>

        <div className="border-t border-border p-3 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.vetChat.placeholder}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[40px] max-h-[120px] py-2.5 px-3"
              rows={1}
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center mt-2 shrink-0">
        AI advice is not a substitute for professional veterinary care.
      </p>
    </div>
  );
}
