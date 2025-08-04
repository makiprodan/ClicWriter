import { test, expect } from '@playwright/test';

test.describe('Teste Simples', () => {
  test('deve acessar a página inicial', async ({ page }) => {
    console.log('Iniciando teste simples...');
    
    try {
      await page.goto('http://localhost:3001');
      console.log('Navegação para localhost:3001 bem-sucedida');
      
      // Aguarda um pouco para a página carregar
      await page.waitForTimeout(2000);
      
      // Verifica se a página carregou
      const title = await page.title();
      console.log(`Título da página: ${title}`);
      
      // Tira uma captura de tela
      await page.screenshot({ path: 'test-results/simple-test.png' });
      console.log('Captura de tela salva');
      
      expect(title).toBeTruthy();
      
    } catch (error) {
      console.error('Erro no teste:', error);
      throw error;
    }
  });
});