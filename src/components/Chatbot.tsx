import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

const PREDEFINED_RESPONSES: Record<string, string> = {
  "solar benefits": `Solar energy provides multiple benefits:
• Reduces electricity bills by 50-80%
• Government subsidies available (₹2-5 lakhs per kW)
• 25-30 year system lifespan
• Low maintenance costs
• Environmentally friendly (saves ~100 trees worth of CO2)
• Increases property value
• Net metering allows selling excess power back`,

  "cost estimation": `Solar system cost breakdown:
• Price: ₹60,000 - 100,000 per kW (depending on quality)
• 3 kW system: ₹1.8 - 3 lakhs
• 5 kW system: ₹3 - 5 lakhs
• Installation included
• Government subsidies can cover 30-50% of cost
• EMI options available: 10-15 year loans
• Break-even in 5-7 years, profit for 20+ years after`,

  "government schemes": `Available Government Schemes:
• PMAY Solar (Prime Minister Awas Yojana): 30% subsidy, ₹3 lakh limit
• National Solar Mission: 35% subsidy for larger systems
• State-specific subsidies: 20-40% depending on state
• DISCOMS subsidies: Direct benefit from electricity boards
• Vendor financing schemes with government backing
• Tax benefits under Section 80D of Income Tax Act
Use our calculator to check your eligibility!`,

  "vendor selection help": `Tips for choosing a solar vendor:
• Check ratings and certifications (NABSEEL certified)
• Verify warranty: 25 year panel, 10 year inverter warranty
• Compare price per kW (₹60k-100k is standard)
• Ask about after-sales service and maintenance
• Look for vendors with government scheme approvals
• Check online reviews and past installations
• Our AI recommender helps find best vendors for your needs!`,

  "how to get started": `Getting started with solar is easy:
1. Use our calculator to estimate your system size
2. Get AI recommendations for best vendor and scheme
3. Receive subsidy eligibility confirmation
4. Our recommended vendors will contact you
5. Site survey and design (free)
6. Installation & commissioning
7. Get net metering connection
8. Start generating your own power!`,

  "faq": `Common Questions:
Q: Will solar work in rainy season?
A: Yes, solar works year-round. Even cloudy days generate power.

Q: Can I expand the system later?
A: Yes, systems are modular and can be upgraded.

Q: What if I move?
A: Systems can be dismantled and reinstalled elsewhere.

Q: Do I need battery storage?
A: Optional. With net metering, excess power goes to grid.`,
};

const QUICK_OPTIONS = [
  "Solar benefits",
  "Cost estimation",
  "Government schemes",
  "Vendor selection help",
  "How to get started",
  "FAQ",
];

export function Chatbot({ className = "" }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      text: "👋 Hi! I'm SolarWise Assistant. I can help you with:\n\n• Solar benefits and advantages\n• Cost estimation and financing\n• Government schemes and subsidies\n• Vendor selection guide\n• Getting started with solar\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate bot thinking time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find matching response
    const lowerInput = userMessage.toLowerCase();
    let botResponse = "I'm not sure about that. Could you ask about solar benefits, cost estimation, government schemes, vendor selection, or getting started?";

    for (const [key, response] of Object.entries(PREDEFINED_RESPONSES)) {
      if (lowerInput.includes(key.toLowerCase())) {
        botResponse = response;
        break;
      }
    }

    // Add bot response
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      text: botResponse,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleQuickOption = (option: string) => {
    handleSendMessage(option);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-96 max-h-96 rounded-xl bg-white shadow-xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-solar p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} />
                <h3 className="font-semibold">SolarWise Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg whitespace-pre-wrap text-sm ${
                      msg.type === "user"
                        ? "text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                    style={msg.type === "user" ? { background: "var(--solar-glow)" } : {}}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce animation-delay-100" />
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce animation-delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Options */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2 font-medium">
                  Quick topics:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleQuickOption(option)}
                      className="text-xs bg-white border border-gray-300 rounded px-2 py-1.5 hover:bg-yellow-50 hover:text-gray-800 transition text-left"
                      style={{ borderColor: "var(--solar)", color: "var(--solar-glow)" }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-200 p-3 bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(input);
                  }
                }}
                placeholder="Ask me anything..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ "--focus-border": "var(--solar-glow)" } as any}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="text-white rounded-lg p-2 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--solar-glow)" }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="text-white rounded-full p-4 shadow-lg transition flex items-center justify-center"
        style={{ background: "var(--solar-glow)" }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
