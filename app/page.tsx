import ChatInterface from "@/components/chat-interface";
import { Send } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Teste do ícone Send */}
      <div className="fixed top-4 left-4 z-50 bg-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-black">Teste Send:</span>
          <Send className="h-4 w-4 text-black" />
          <Send className="h-5 w-5 text-black" />
          <Send className="h-6 w-6 text-black" />
        </div>
      </div>
      <ChatInterface />
    </main>
  );
}