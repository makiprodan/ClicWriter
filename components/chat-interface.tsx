"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Plus, Menu, User, Bot, Trash2, Edit3, Paperclip, Mic, MicOff, Upload, Square, Play, X, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextAnimate } from "@/components/ui/text-animate";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export default function ChatInterface() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [user_id] = useState(() => {
    // Gera um user_id único para cada aba/seção do navegador
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    const cryptoRandom = typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues
      ? window.crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
      : Math.random().toString(36).substring(2, 11);
    
    const browserUserId = `user_${timestamp}_${randomStr}_${cryptoRandom}`;
    console.log('Novo usuário iniciado:', browserUserId);
    return browserUserId;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingCancelledRef = useRef<boolean>(false);

  const currentChat = chats.find(chat => chat.id === currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  // Função para aplicar o tema
  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
    
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Carregar tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    applyTheme(savedTheme);
  }, []);

  // Escutar mudanças no tema do sistema
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const createNewChat = () => {
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const newChat: Chat = {
      id: chatId,
      title: "Nova Conversa",
      messages: [],
      createdAt: new Date(),
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(chatId);
    console.log('Nova conversa criada:', { user_id, chatId });
    return chatId;
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const updateChatTitle = (chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const startEditingTitle = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const saveEditingTitle = () => {
    if (editingChatId && editingTitle.trim()) {
      updateChatTitle(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle("");
  };

  const cancelEditingTitle = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const sendToWebhook = async (data: {
    chatInput?: string;
    user_id: string;
    chatId: string;
    filename?: string;
    filetype?: string;
    audioData?: Blob;
    file?: File;
  }) => {
    try {
      console.log('Enviando para webhook:', {
        user_id: data.user_id,
        chatId: data.chatId,
        hasText: !!data.chatInput,
        hasAudio: !!data.audioData,
        hasFile: !!data.file,
        fileName: data.file?.name || (data.audioData ? 'audio_recording' : undefined)
      });

      const formData = new FormData();
      formData.append('user_id', data.user_id);
      formData.append('chatId', data.chatId);
      
      if (data.chatInput) {
        formData.append('chatInput', data.chatInput);
      }
      
      if (data.audioData) {
        const audioFilename = `recording_${Date.now()}.webm`;
        formData.append('file', data.audioData, audioFilename);
        formData.append('filename', audioFilename);
        formData.append('filetype', 'audio/webm');
      }
      
      if (data.file) {
        formData.append('file', data.file, data.file.name);
        formData.append('filename', data.file.name);
        formData.append('filetype', data.file.type);
      }

      const response = await fetch('https://n8nclicrdc.conda.eleicoes.info/webhook/openwebui', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Processar resposta JSON do webhook
      const result = await response.json();
      console.log('Resposta do webhook recebida:', result);
      console.log('Tipo da resposta:', typeof result);
      console.log('É array?', Array.isArray(result));
      
      // Verificar se a resposta está no formato esperado: [{ "output": "resposta em markdown" }]
      if (Array.isArray(result) && result.length > 0 && result[0].output) {
        console.log('Extraindo output:', result[0].output);
        return result[0].output;
      }
      
      // Verificar se a resposta é um objeto direto com output
      if (result && typeof result === 'object' && result.output) {
        console.log('Extraindo output direto:', result.output);
        return result.output;
      }
      
      // Fallback se o formato não for o esperado
      console.log('Formato não reconhecido, retornando JSON completo');
      return JSON.stringify(result);
    } catch (error) {
      console.error('Erro ao enviar para webhook:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingCancelledRef.current = false; // Reset da flag de cancelamento

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && !recordingCancelledRef.current) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Parar timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingTime(0);
        
        // Só processar se não foi cancelado E há chunks de áudio
        if (!recordingCancelledRef.current && audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          let chatId = currentChatId;
          if (!chatId) {
            chatId = createNewChat();
          }

          try {
            // Adicionar mensagem de áudio ao chat
            const audioMessage: Message = {
              id: Date.now().toString(),
              content: "🎤 Áudio enviado",
              role: "user",
              timestamp: new Date(),
            };

            setChats(prev => prev.map(chat => 
              chat.id === chatId 
                ? { ...chat, messages: [...chat.messages, audioMessage] }
                : chat
            ));

            setIsLoading(true);

            // Enviar para o webhook e processar resposta
            const response = await sendToWebhook({
              user_id,
              chatId,
              audioData: audioBlob,
            });

            // Exibir resposta do agente
            if (response) {
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response,
                role: "assistant",
                timestamp: new Date(),
              };

              setChats(prev => prev.map(chat => 
                chat.id === chatId 
                  ? { ...chat, messages: [...chat.messages, assistantMessage] }
                  : chat
              ));
            }

            // Delay mínimo para garantir que o loading seja visível
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
          } catch (error) {
            console.error('Erro ao enviar áudio:', error);
            setIsLoading(false);
            
            // Fallback em caso de erro
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: "Desculpe, ocorreu um erro ao processar seu áudio. Tente novamente.",
              role: "assistant",
              timestamp: new Date(),
            };

            setChats(prev => prev.map(chat => 
              chat.id === chatId 
                ? { ...chat, messages: [...chat.messages, errorMessage] }
                : chat
            ));
          }
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Iniciar timer
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Marcar como cancelado ANTES de parar
      recordingCancelledRef.current = true;
      
      // Limpar chunks
      audioChunksRef.current = [];
      
      // Parar gravação
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Limpar timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
      
      // Parar todas as tracks do stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Função para formatar o tempo de gravação
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Enviar arquivo automaticamente sem confirmação
      await sendFileDirectly(file);
    }
  };

  const sendFileDirectly = async (file: File) => {
    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    try {
      // Adicionar mensagem de arquivo ao chat
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `📎 Arquivo enviado: ${file.name}`,
        role: "user",
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, fileMessage] }
          : chat
      ));

      setIsLoading(true);

      // Enviar para o webhook e processar resposta
      const response = await sendToWebhook({
        user_id,
        chatId,
        file: file,
      });

      // Exibir resposta do agente
      if (response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          role: "assistant",
          timestamp: new Date(),
        };

        setChats(prev => prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        ));
      }

      // Delay mínimo para garantir que o loading seja visível
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      setIsLoading(false);
      
      // Fallback em caso de erro
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, ocorreu um erro ao processar seu arquivo. Tente novamente.",
        role: "assistant",
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ));
    }
  };

  const sendFile = async () => {
    if (!selectedFile) return;
    await sendFileDirectly(selectedFile);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let chatId = currentChatId;
    let chatToUpdate = currentChat;
    
    if (!chatToUpdate) {
      chatId = createNewChat();
      chatToUpdate = chats.find(chat => chat.id === chatId);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    // Atualizar o título do chat se for a primeira mensagem
    if (chatToUpdate && chatToUpdate.messages.length === 0) {
      const title = input.trim().slice(0, 30) + (input.trim().length > 30 ? "..." : "");
      updateChatTitle(chatId!, title);
    }

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, userMessage] }
        : chat
    ));

    const messageText = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Enviar para o webhook e processar resposta
      const response = await sendToWebhook({
        chatInput: messageText,
        user_id,
        chatId: chatId!,
      });

      // Usar a resposta do webhook diretamente
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response || generateAIResponse(messageText),
        role: "assistant",
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
      // Delay mínimo para garantir que o loading seja visível
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setIsLoading(false);
      
      // Fallback para resposta local em caso de erro
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        role: "assistant",
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, assistantMessage] }
          : chat
      ));
    }
  };

  // Função para testar resposta JSON do webhook
  const testWebhookResponse = () => {
    // Simular exatamente o formato que você mostrou
    const mockWebhookResponse = {
      "output": "Olá! 👋 \n\nPara criar a matéria jornalística que você solicitou, preciso do  texto base  ou do  tema/assunto  sobre o qual devo escrever.\n\nVocê pode me fornecer:\n- O texto base da notícia\n- Um link para a fonte\n- Ou o tema específico que devo pesquisar\n\nCom essas informações, criarei:\n✅ Matéria seguindo pirâmide invertida com lead claro \n✅ 3 sugestões de títulos atrativos \n✅ Subtítulo atrativo \n✅ Definição em 1-2 palavras com emojis para Instagram \n✅ 10 tags relevantes \n✅ Categorias apropriadas \n\nQual será o assunto da matéria? 📰"
    };

    console.log('Testando com formato:', mockWebhookResponse);
    console.log('Tipo:', typeof mockWebhookResponse);
    console.log('Tem output?', !!mockWebhookResponse.output);

    let chatId = currentChatId;
    if (!chatId) {
      chatId = createNewChat();
    }

    const testMessage: Message = {
      id: Date.now().toString(),
      content: "🧪 Teste de resposta do webhook (formato objeto direto)",
      role: "user",
      timestamp: new Date(),
    };

    // Simular o processamento que acontece na função sendToWebhook
    let processedContent = '';
    if (mockWebhookResponse && typeof mockWebhookResponse === 'object' && mockWebhookResponse.output) {
      processedContent = mockWebhookResponse.output;
      console.log('✅ Processamento correto - extraindo output direto');
    } else {
      processedContent = JSON.stringify(mockWebhookResponse);
      console.log('❌ Fallback - retornando JSON completo');
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: processedContent,
      role: "assistant",
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, messages: [...chat.messages, testMessage, assistantMessage] }
        : chat
    ));
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      `## Resposta sobre: "${userInput}"

Entendo sua pergunta! Vou explicar de forma **detalhada** para que você possa compreender melhor.

### Pontos importantes:

1. **Primeiro ponto**: Análise inicial do problema
2. **Segundo ponto**: Considerações técnicas
3. **Terceiro ponto**: Implementação prática

> Esta é uma citação importante sobre o tópico em questão.

#### Exemplo de código:

\`\`\`javascript
function exemplo() {
  console.log("Olá, mundo!");
  return "Resposta processada";
}
\`\`\`

Para mais informações, você pode usar \`código inline\` ou consultar a documentação.

| Coluna 1 | Coluna 2 | Coluna 3 |
|----------|----------|----------|
| Valor A  | Valor B  | Valor C  |
| Dado 1   | Dado 2   | Dado 3   |

**Conclusão**: Esta resposta demonstra a renderização de markdown no chat!`,

      `# Excelente pergunta!

Existem várias perspectivas que podemos considerar sobre **${userInput}**.

## Lista de considerações:

- ✅ Aspecto técnico
- ✅ Aspecto prático  
- ✅ Aspecto teórico

### Código de exemplo:

\`\`\`python
def processar_resposta(entrada):
    """Processa a entrada do usuário"""
    resultado = entrada.upper()
    return f"Processado: {resultado}"
\`\`\`

> **Dica**: Sempre considere as melhores práticas ao implementar soluções.

*Espero que isso esclareça sua dúvida!*`,

      `## Análise detalhada

Vou ajudá-lo com **${userInput}**. Primeiro, é importante entender os conceitos fundamentais envolvidos.

### Estrutura da resposta:

1. **Introdução**
   - Contexto do problema
   - Objetivos principais

2. **Desenvolvimento**
   - Análise técnica
   - Exemplos práticos

3. **Conclusão**
   - Resumo dos pontos
   - Próximos passos

#### Exemplo prático:

\`\`\`bash
# Comando de exemplo
npm install react-markdown
\`\`\`

| Recurso | Descrição | Status |
|---------|-----------|--------|
| Markdown | Renderização | ✅ Ativo |
| Código | Highlight | ✅ Ativo |
| Tabelas | Suporte | ✅ Ativo |

**Resultado**: Implementação completa de markdown no chat!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className={cn(
        "relative border-r border-border transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <ShimmerButton
              onClick={createNewChat}
              className="h-8 w-8 p-0 group"
              background="rgba(59, 130, 246, 0.1)"
              shimmerColor="#3b82f6"
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            </ShimmerButton>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center justify-between rounded-lg p-3 mb-2 cursor-pointer transition-colors",
                  currentChatId === chat.id 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/50"
                )}
                onClick={() => setCurrentChatId(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditingTitle();
                          if (e.key === 'Escape') cancelEditingTitle();
                        }}
                        onBlur={saveEditingTitle}
                        className="w-full text-sm font-medium bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        {chat.messages.length} mensagens
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {chat.messages.length} mensagens
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingTitle(chat.id, chat.title);
                    }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        {/* Background Pattern */}
        <DotPattern
          className="opacity-30"
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                ClicWriter
              </h1>
              {currentChat?.title && (
                <span className="text-xs text-muted-foreground">
                  {currentChat.title}
                </span>
              )}
            </div>
          </div>
          
          {/* Theme Selector */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => applyTheme('light')}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                theme === 'light' 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
              title="Tema claro"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyTheme('dark')}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                theme === 'dark' 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
              title="Tema escuro"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              onClick={() => applyTheme('system')}
              className={cn(
                "p-2 rounded-md transition-all duration-200",
                theme === 'system' 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
              title="Tema automático"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 relative z-10">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="max-w-md">
                <TextAnimate
                  animation="blurInUp"
                  by="word"
                  className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
                >
                  Olá! Como posso ajudar?
                </TextAnimate>
                <TextAnimate
                  animation="fadeIn"
                  delay={0.5}
                  className="text-muted-foreground mb-8"
                >
                  Faça uma pergunta ou inicie uma conversa. Estou aqui para ajudar com qualquer coisa que você precisar.
                </TextAnimate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Explique conceitos complexos",
                    "Ajude com programação",
                    "Escreva textos criativos",
                    "Resolva problemas"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="p-4 text-left border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <TextAnimate
                        animation="slideUp"
                        delay={0.7 + index * 0.1}
                        className="text-sm"
                      >
                        {suggestion}
                      </TextAnimate>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentChat.messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4 p-4 rounded-lg",
                    message.role === "user" 
                      ? "bg-primary/5 ml-12" 
                      : "bg-muted/30 mr-12"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "Você" : "Assistente"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Customizar componentes do markdown
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                              <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className="bg-muted px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({ children }: any) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                              {children}
                            </blockquote>
                          ),
                          table: ({ children }: any) => (
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse border border-border">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }: any) => (
                            <th className="border border-border px-3 py-2 bg-muted font-semibold text-left">
                              {children}
                            </th>
                          ),
                          td: ({ children }: any) => (
                            <td className="border border-border px-3 py-2">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 p-4 rounded-lg bg-muted/30 mr-12 border border-primary/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Assistente</span>
                      <span className="text-xs text-muted-foreground">está digitando...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full loading-dot-1" />
                      <div className="w-2 h-2 bg-primary rounded-full loading-dot-2" />
                      <div className="w-2 h-2 bg-primary rounded-full loading-dot-3" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Mini Player de Gravação */}
            {isRecording && (
              <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Recording Indicator */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Gravando
                      </span>
                    </div>
                    
                    {/* Timer */}
                    <div className="px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full border border-red-200 dark:border-red-700/30">
                      <span className="text-sm font-mono font-medium text-red-800 dark:text-red-200">
                        {formatRecordingTime(recordingTime)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                   <div className="flex items-center gap-2">
                     <button
                       onClick={cancelRecording}
                       className="p-3 bg-white hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600 rounded-full transition-all duration-200 hover:shadow-md group"
                       title="Cancelar gravação"
                     >
                       <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                     </button>
                     <button
                       onClick={stopRecording}
                       className="p-3 bg-green-500 hover:bg-green-600 text-black rounded-full transition-all duration-200 hover:shadow-md group"
                       title="Finalizar e enviar gravação"
                     >
                       <Send className="h-5 w-5 group-hover:scale-110 transition-transform" />
                     </button>
                   </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 items-start">
              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-lg transition-colors min-h-[50px] flex items-center justify-center bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  title="Anexar arquivo"
                  disabled={isRecording}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full p-3 border border-border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[50px] max-h-32"
                  rows={1}
                  style={{
                    height: "auto",
                    minHeight: "50px",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = Math.min(target.scrollHeight, 128) + "px";
                  }}
                />
              </div>
              
              {/* Botão dinâmico: Gravar quando vazio, Enviar quando há texto */}
              {input.trim() ? (
                <button
                  onClick={sendMessage}
                  disabled={isLoading}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-200 min-h-[50px] flex items-center justify-center",
                    !isLoading
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-105"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  title="Enviar mensagem"
                >
                  <Send className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={cn(
                    "p-3 rounded-lg transition-all duration-200 min-h-[50px] flex items-center justify-center",
                    !isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white transform hover:scale-105"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  title="Gravar áudio"
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pressione Enter para enviar, Shift+Enter para nova linha • 
              {isRecording && <span className="text-destructive font-medium"> 🔴 Gravando...</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}