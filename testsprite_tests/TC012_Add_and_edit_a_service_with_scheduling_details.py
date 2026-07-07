import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Başla' button to enter the demo dashboard.
        # Başla button
        elem = page.get_by_role('button', name='Başla', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Demo ile devam et' button to enter the demo dashboard.
        # Demo ile devam et → button
        elem = page.get_by_role('button', name='Demo ile devam et →', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Hizmetler' link in the left sidebar to open the Services workspace.
        # Hizmetler link
        elem = page.get_by_role('link', name='Hizmetler', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Hizmet ekle' (Add service) button to open the new service form.
        # Hizmet ekle button
        elem = page.get_by_role('button', name='Hizmet ekle', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Hizmet adı', 'Süre (dk)', and 'Fiyat (₺)' fields, select a 'Renk / kategori', and click the 'Hizmeti ekle' button to add the service.
        # örn. Saç kesimi text field
        elem = page.locator('[id="sf-name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Otomasyon Test Hizmeti")
        
        # -> Fill the 'Hizmet adı', 'Süre (dk)', and 'Fiyat (₺)' fields, select a 'Renk / kategori', and click the 'Hizmeti ekle' button to add the service.
        # number field
        elem = page.locator('[id="sf-dur"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("60")
        
        # -> Fill the 'Hizmet adı', 'Süre (dk)', and 'Fiyat (₺)' fields, select a 'Renk / kategori', and click the 'Hizmeti ekle' button to add the service.
        # number field
        elem = page.locator('[id="sf-price"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("350")
        
        # -> Fill the 'Hizmet adı', 'Süre (dk)', and 'Fiyat (₺)' fields, select a 'Renk / kategori', and click the 'Hizmeti ekle' button to add the service.
        # Boya button
        elem = page.get_by_role('button', name='Boya', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Hizmet adı', 'Süre (dk)', and 'Fiyat (₺)' fields, select a 'Renk / kategori', and click the 'Hizmeti ekle' button to add the service.
        # Hizmeti ekle button
        elem = page.get_by_role('button', name='Hizmeti ekle', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Otomasyon Test Hizmeti' service row to view details and click the 'Hizmeti düzenle' (Edit service) button.
        # Otomasyon Test Hizmeti color 1h — 0 ₺350
        elem = page.get_by_text('Otomasyon Test Hizmeti color 1h — 0 ₺350', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Otomasyon Test Hizmeti' service row to view details and click the 'Hizmeti düzenle' (Edit service) button.
        # Hizmeti düzenle button
        elem = page.get_by_role('button', name='Hizmeti düzenle', exact=True)
        await elem.click(timeout=10000)
        
        # -> Set 'Süre (dk)' to '90', set 'Fiyat (₺)' to '450', select the 'Spa' category, then click the 'Değişiklikleri kaydet' button to save the updated service.
        # number field
        elem = page.locator('[id="sf-dur"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("90")
        
        # -> Set 'Süre (dk)' to '90', set 'Fiyat (₺)' to '450', select the 'Spa' category, then click the 'Değişiklikleri kaydet' button to save the updated service.
        # number field
        elem = page.locator('[id="sf-price"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("450")
        
        # -> Set 'Süre (dk)' to '90', set 'Fiyat (₺)' to '450', select the 'Spa' category, then click the 'Değişiklikleri kaydet' button to save the updated service.
        # Spa button
        elem = page.get_by_role('button', name='Spa', exact=True)
        await elem.click(timeout=10000)
        
        # -> Set 'Süre (dk)' to '90', set 'Fiyat (₺)' to '450', select the 'Spa' category, then click the 'Değişiklikleri kaydet' button to save the updated service.
        # Değişiklikleri kaydet button
        elem = page.get_by_role('button', name='Değişiklikleri kaydet', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the service appears in the services list
        # Assert: Service 'Otomasyon Test Hizmeti' appears in the services list.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[1]").nth(0)).to_contain_text("Otomasyon Test Hizmeti", timeout=15000), "Service 'Otomasyon Test Hizmeti' appears in the services list."
        
        # --> Verify the updated service details are reflected
        # Assert: The services list shows the service name 'Otomasyon Test Hizmeti'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[1]/div/div/p[1]").nth(0)).to_have_text("Otomasyon Test Hizmeti", timeout=15000), "The services list shows the service name 'Otomasyon Test Hizmeti'."
        # Assert: The services list shows the service category 'spa'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[1]/div/div/p[2]").nth(0)).to_have_text("spa", timeout=15000), "The services list shows the service category 'spa'."
        # Assert: The services list shows the updated duration '1h 30m'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[2]/span").nth(0)).to_have_text("1h 30m", timeout=15000), "The services list shows the updated duration '1h 30m'."
        # Assert: The services list shows the updated price '₺450'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[5]").nth(0)).to_have_text("\u20ba450", timeout=15000), "The services list shows the updated price '\u20ba450'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    