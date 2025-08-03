# ClicWriter

Um clone do ChatGPT criado com Next.js, React, TypeScript e componentes do Magic UI.

## Características

- ✨ Interface moderna e responsiva
- 💬 Múltiplas conversas
- 🎨 Animações suaves com Magic UI
- 🌙 Tema escuro
- 📱 Design responsivo
- ⚡ Performance otimizada

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Magic UI** - Componentes animados
- **Lucide React** - Ícones

## Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Funcionalidades

- **Múltiplas Conversas**: Crie e gerencie várias conversas
- **Sidebar Responsiva**: Navegue facilmente entre conversas
- **Animações de Texto**: Efeitos visuais suaves para mensagens
- **Simulação de IA**: Respostas automáticas simuladas
- **Interface Intuitiva**: Design familiar ao ChatGPT

## Estrutura do Projeto

```
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx           # Página inicial
│   └── globals.css        # Estilos globais
├── components/
│   ├── ui/                # Componentes Magic UI
│   └── chat-interface.tsx # Interface principal do chat
├── lib/
│   └── utils.ts          # Utilitários
└── package.json          # Dependências
```

## Componentes Magic UI Utilizados

- **TextAnimate**: Animações de texto suaves
- **ShimmerButton**: Botões com efeito brilhante
- **DotPattern**: Padrão de fundo decorativo

## Personalização

Você pode personalizar cores, animações e comportamentos editando:

- `tailwind.config.js` - Configurações do Tailwind
- `app/globals.css` - Variáveis CSS e estilos globais
- `components/chat-interface.tsx` - Lógica principal do chat
