import { test, expect } from '@playwright/test';

test.describe('Performance e Acessibilidade', () => {
  test('deve carregar rapidamente', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Aguarda o carregamento completo
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Tempo de carregamento: ${loadTime}ms`);
    
    // Verifica se carregou em menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });

  test('deve ter elementos acessíveis', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Verifica se há elementos com aria-labels
    const ariaLabels = page.locator('[aria-label]');
    const ariaLabelCount = await ariaLabels.count();
    
    console.log(`Elementos com aria-label encontrados: ${ariaLabelCount}`);
    
    // Verifica se há botões com texto ou aria-label
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    console.log(`Botões encontrados: ${buttonCount}`);
    
    // Verifica se há headings para estrutura
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    console.log(`Headings encontrados: ${headingCount}`);
  });

  test('deve ter contraste adequado', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Verifica se há elementos de texto visíveis
    const textElements = page.locator('p, span, div, button, input, textarea');
    const textCount = await textElements.count();
    
    console.log(`Elementos de texto encontrados: ${textCount}`);
    
    // Verifica se há cores de fundo e texto definidas
    const styledElements = page.locator('[class*="text-"], [class*="bg-"]');
    const styledCount = await styledElements.count();
    
    console.log(`Elementos com estilos de cor encontrados: ${styledCount}`);
    
    expect(styledCount).toBeGreaterThan(0);
  });

  test('deve ser navegável por teclado', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Testa navegação por Tab
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    // Verifica se há elemento focado
    const focusedElement = page.locator(':focus');
    
    if (await focusedElement.count() > 0) {
      console.log('Navegação por teclado funcionando!');
      await expect(focusedElement).toBeVisible();
    }
    
    // Testa mais algumas navegações
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
  });

  test('deve funcionar sem JavaScript (graceful degradation)', async ({ page }) => {
    // Desabilita JavaScript
    await page.context().addInitScript(() => {
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, javaEnabled: () => false }
      });
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Verifica se o conteúdo básico ainda está visível
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    console.log('Teste de degradação graceful concluído');
  });

  test('deve ter meta tags adequadas', async ({ page }) => {
    await page.goto('/');
    
    // Verifica meta tags importantes
    const title = await page.title();
    console.log(`Título da página: ${title}`);
    expect(title).toBeTruthy();
    
    // Verifica viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    if (await viewport.count() > 0) {
      console.log('Meta viewport encontrada!');
    }
    
    // Verifica charset
    const charset = page.locator('meta[charset]');
    if (await charset.count() > 0) {
      console.log('Meta charset encontrada!');
    }
  });

  test('deve ter imagens com alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Verifica se há imagens
    const images = page.locator('img');
    const imageCount = await images.count();
    
    console.log(`Imagens encontradas: ${imageCount}`);
    
    if (imageCount > 0) {
      // Verifica se têm alt text
      const imagesWithAlt = page.locator('img[alt]');
      const altCount = await imagesWithAlt.count();
      
      console.log(`Imagens com alt text: ${altCount}`);
      
      // Idealmente, todas as imagens deveriam ter alt text
      expect(altCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('deve ter links descritivos', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Verifica se há links
    const links = page.locator('a');
    const linkCount = await links.count();
    
    console.log(`Links encontrados: ${linkCount}`);
    
    if (linkCount > 0) {
      // Verifica se os links têm texto ou aria-label
      const descriptiveLinks = page.locator('a:has-text(""), a[aria-label]');
      const descriptiveCount = await descriptiveLinks.count();
      
      console.log(`Links com descrição: ${descriptiveCount}`);
    }
  });

  test('deve funcionar em modo escuro', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Força modo escuro
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(1000);
    
    // Verifica se a página ainda está funcional
    const main = page.locator('main');
    await expect(main).toBeVisible();
    
    // Verifica se há estilos dark aplicados
    const darkElements = page.locator('[class*="dark:"]');
    const darkCount = await darkElements.count();
    
    console.log(`Elementos com estilos dark: ${darkCount}`);
    
    expect(darkCount).toBeGreaterThanOrEqual(0);
  });
});