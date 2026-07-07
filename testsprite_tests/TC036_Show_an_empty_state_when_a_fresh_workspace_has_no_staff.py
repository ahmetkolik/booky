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
        
        # -> Open the signup page (navigate to the app's /signup page or click the 'Ücretsiz başla' entrypoint).
        await page.goto("http://localhost:3000/signup")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Fill the 'Ad Soyad', 'E-posta', and 'Şifre' fields and click the 'Başla' button to submit the signup form and create a fresh workspace.
        # Adın Soyadın text field
        elem = page.locator('[id="name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Ad Soyad', 'E-posta', and 'Şifre' fields and click the 'Başla' button to submit the signup form and create a fresh workspace.
        # you@company.com email field
        elem = page.locator('[id="email"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("fresh@example.com")
        
        # -> Fill the 'Ad Soyad', 'E-posta', and 'Şifre' fields and click the 'Başla' button to submit the signup form and create a fresh workspace.
        # •••••••• password field
        elem = page.locator('[id="password"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Password123!")
        
        # -> Fill the 'Ad Soyad', 'E-posta', and 'Şifre' fields and click the 'Başla' button to submit the signup form and create a fresh workspace.
        # Başla button
        elem = page.get_by_role('button', name='Başla', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'İşletme adı' field with 'Bos Salon'.
        # örn. Glow Studio text field
        elem = page.locator('[id="bname"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Bos Salon")
        
        # -> Click the 'Devam et' button on the onboarding Step 1 page to proceed to Step 2 (category selection).
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Berber' category button to select the business type.
        # Berber button
        elem = page.get_by_role('button', name='Berber', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Devam et' button on the onboarding Step 2 page to proceed to Step 3.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Panele git' button to finish onboarding and enter the dashboard.
        # Panele git button
        elem = page.get_by_role('button', name='Panele git', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Personel' page by clicking the 'Personel' link in the sidebar to verify the staff empty state.
        # Personel link
        elem = page.get_by_role('link', name='Personel', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the empty state message 'Henüz personel yok' is visible
        # Assert: The empty state heading 'Henüz personel yok' is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/span").nth(0)).to_have_text("Hen\u00fcz personel yok", timeout=15000), "The empty state heading 'Hen\u00fcz personel yok' is visible."
        
        # --> Verify no staff cards are shown and an 'İlk personelini ekle' button is offered
        # Assert: Empty-state heading 'Henüz personel yok' is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/span").nth(0)).to_have_text("Hen\u00fcz personel yok", timeout=15000), "Empty-state heading 'Hen\u00fcz personel yok' is visible."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: The 'İlk personelini ekle' button is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button").nth(0)).to_be_visible(timeout=15000), "The '\u0130lk personelini ekle' button is visible."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    