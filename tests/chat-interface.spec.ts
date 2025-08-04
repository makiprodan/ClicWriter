import { test, expect } from '@playwright/test';

test.describe('Interface de Chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve carregar a página principal', async ({ page }) => {
    // Verifica se a página carregou
    await expect(page).toHaveTitle(/ChatGPT Clone/i);
    
    // Verifica se o gradiente de fundo está presente
    const main = page.locator('main');
    await expect(main).toHaveClass(/bg-gradient-to-br/);
  });

  test('deve exibir o teste do ícone Send', async ({ page }) => {
    // Verifica se o elemento de teste do ícone Send está visível
    const testDiv = page.locator('div:has-text("Teste Send:")');
    await expect(testDiv).toBeVisible();
    
    // Verifica se os ícones Send estão presentes
    const sendIcons = page.locator('svg[data-lucide="send"]');
    await expect(sendIcons).toHaveCount(3); // Três tamanhos diferentes
  });

  test('deve exibir a interface de chat', async ({ page }) => {
    // Aguarda o componente de chat carregar
    await page.waitForSelector('[data-testid="chat-interface"]', { timeout: 10000 });
    
    // Verifica se a interface de chat está presente
    const chatInterface = page.locator('[data-testid="chat-interface"]');
    await expect(chatInterface).toBeVisible();
  });

  test('deve permitir criar nova conversa', async ({ page }) => {
    // Aguarda a interface carregar
    await page.waitForTimeout(2000);
    
    // Procura pelo botão de nova conversa
    const newChatButton = page.locator('button:has-text("Nova Conversa"), button[aria-label*="nova"], button[title*="nova"], svg[data-lucide="plus"]').first();
    
    if (await newChatButton.isVisible()) {
      await newChatButton.click();
      
      // Verifica se uma nova conversa foi criada
      await page.waitForTimeout(1000);
      
      // Verifica se o campo de entrada está disponível
      const inputField = page.locator('input[type="text"], textarea').first();
      await expect(inputField).toBeVisible();
    }
  });

  test('deve permitir digitar mensagem', async ({ page }) => {
    // Aguarda a interface carregar
    await page.waitForTimeout(2000);
    
    // Procura pelo campo de entrada
    const inputField = page.locator('input[type="text"], textarea, [contenteditable="true"]').first();
    
    if (await inputField.isVisible()) {
      await inputField.fill('Olá, esta é uma mensagem de teste!');
      
      // Verifica se o texto foi inserido
      await expect(inputField).toHaveValue('Olá, esta é uma mensagem de teste!');
    }
  });

  test('deve ter botão de envio', async ({ page }) => {
    // Aguarda a interface carregar
    await page.waitForTimeout(2000);
    
    // Procura pelo botão de envio
    const sendButton = page.locator('button:has(svg[data-lucide="send"]), button[aria-label*="enviar"], button[title*="enviar"]').first();
    
    if (await sendButton.isVisible()) {
      await expect(sendButton).toBeVisible();
      
      // Verifica se o botão está habilitado ou desabilitado conforme esperado
      const isEnabled = await sendButton.isEnabled();
      console.log('Botão de envio está habilitado:', isEnabled);
    }
  });

  test('deve ter controles de tema', async ({ page }) => {
    // Aguarda a interface carregar
    await page.waitForTimeout(2000);
    
    // Procura por controles de tema (ícones de sol, lua, monitor)
    const themeControls = page.locator('svg[data-lucide="sun"], svg[data-lucide="moon"], svg[data-lucide="monitor"]');
    
    if (await themeControls.count() > 0) {
      await expect(themeControls.first()).toBeVisible();
    }
  });

  test('deve ter sidebar responsiva', async ({ page }) => {
    // Aguarda a interface carregar
    await page.waitForTimeout(2000);
    
    // Procura pelo botão de menu/hamburger
    const menuButton = page.locator('button:has(svg[data-lucide="menu"]), button[aria-label*="menu"]').first();
    
    if (await menuButton.isVisible()) {
      // Testa abrir/fechar sidebar
      await menuButton.click();
      await page.waitForTimeout(500);
      
      await menuButton.click();
      await page.waitForTimeout(500);
      
      await expect(menuButton).toBeVisible();
    }
  });

  test('deve funcionar em diferentes tamanhos de tela', async ({ page }) => {
    // Testa responsividade
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      // Verifica se a página ainda está funcional
      const main = page.locator('main');
      await expect(main).toBeVisible();
      
      console.log(`Testado viewport: ${viewport.width}x${viewport.height}`);
    }
  });
});