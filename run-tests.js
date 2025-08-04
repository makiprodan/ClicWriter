const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando Testes Automatizados da Interface de Chat');
console.log('=' .repeat(60));

// Verifica se o diretório de testes existe
const testsDir = path.join(__dirname, 'tests');
if (!fs.existsSync(testsDir)) {
  console.error('❌ Diretório de testes não encontrado!');
  process.exit(1);
}

// Lista os arquivos de teste
const testFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.spec.ts'));
console.log('📁 Arquivos de teste encontrados:');
testFiles.forEach(file => {
  console.log(`   - ${file}`);
});

console.log('\n🔧 Configuração do Playwright:');
console.log('   - Navegadores: Chromium, Firefox, WebKit');
console.log('   - Modo: Headed (com interface visual)');
console.log('   - Servidor: http://localhost:3001');

console.log('\n📋 Testes Implementados:');

console.log('\n1. 🖥️  Interface Básica (chat-interface.spec.ts):');
console.log('   ✓ Carregamento da página');
console.log('   ✓ Presença de elementos UI');
console.log('   ✓ Funcionalidade de envio de mensagens');
console.log('   ✓ Controles de tema');
console.log('   ✓ Responsividade');

console.log('\n2. 🚀 Funcionalidades Avançadas (chat-advanced.spec.ts):');
console.log('   ✓ Persistência de dados (localStorage)');
console.log('   ✓ Controles de gravação de áudio');
console.log('   ✓ Upload de arquivos');
console.log('   ✓ Edição de títulos de conversa');
console.log('   ✓ Animações e transições');
console.log('   ✓ Scroll automático');

console.log('\n3. ⚡ Performance e Acessibilidade (performance-accessibility.spec.ts):');
console.log('   ✓ Tempo de carregamento');
console.log('   ✓ Elementos acessíveis (ARIA)');
console.log('   ✓ Contraste de cores');
console.log('   ✓ Navegação por teclado');
console.log('   ✓ Meta tags e SEO');
console.log('   ✓ Modo escuro');

console.log('\n4. 🔍 Teste Simples (simple-test.spec.ts):');
console.log('   ✓ Verificação básica de conectividade');
console.log('   ✓ Captura de tela');

console.log('\n📊 Para executar os testes:');
console.log('   npm run dev                    # Inicia o servidor');
console.log('   npx playwright test --headed   # Executa todos os testes');
console.log('   npx playwright test --ui       # Interface visual dos testes');

console.log('\n🎯 Comandos específicos:');
console.log('   npx playwright test tests/chat-interface.spec.ts');
console.log('   npx playwright test tests/chat-advanced.spec.ts');
console.log('   npx playwright test tests/performance-accessibility.spec.ts');
console.log('   npx playwright test tests/simple-test.spec.ts');

console.log('\n📈 Relatórios:');
console.log('   npx playwright show-report     # Visualiza relatório HTML');
console.log('   test-results/                  # Capturas de tela e vídeos');

console.log('\n✅ Setup de Testes Automatizados Concluído!');
console.log('=' .repeat(60));

// Verifica se o servidor está rodando
try {
  const { execSync } = require('child_process');
  execSync('netstat -ano | findstr :3001', { stdio: 'pipe' });
  console.log('🟢 Servidor detectado na porta 3001');
} catch (error) {
  console.log('🟡 Servidor não detectado - execute "npm run dev" primeiro');
}

console.log('\n🎉 Pronto para testar a interface de chat!');