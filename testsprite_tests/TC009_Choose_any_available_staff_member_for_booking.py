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
        
        # -> Open the demo booking page by navigating to /book/demo (open the demo booking page).
        await page.goto("http://localhost:3000/book/demo")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Devam et' (Continue) button to proceed to the Personel (staff) selection step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Fark etmez' (Any available staff) option on the Personel seçin screen.
        # 🎲 Fark etmez İlk uygun personel button
        elem = page.get_by_role('button', name='🎲 Fark etmez İlk uygun personel', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Devam et' button to go to the Tarih & Saat (Date & Time) step
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the available time slot '09:00' then click the 'Devam et' button to proceed to the confirmation/customer details step.
        # 09:00 button
        elem = page.get_by_role('button', name='09:00', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the available time slot '09:00' then click the 'Devam et' button to proceed to the confirmation/customer details step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid Turkish phone number, then click the 'Randevuyu onayla' button.
        # Adınız Soyadınız text field
        elem = page.get_by_placeholder('Adınız Soyadınız', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("QA Test 2026-07-07")
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid Turkish phone number, then click the 'Randevuyu onayla' button.
        # +90 5xx xxx xx xx tel field
        elem = page.get_by_placeholder('+90 5xx xxx xx xx', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("+90 532 123 45 67")
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid Turkish phone number, then click the 'Randevuyu onayla' button.
        # Randevuyu onayla button
        elem = page.get_by_role('button', name='Randevuyu onayla', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify a booking confirmation screen is visible
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: Booking confirmation shows the 'Yeni randevu al' button.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0)).to_be_visible(timeout=15000), "Booking confirmation shows the 'Yeni randevu al' button."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/a").nth(0).scroll_into_view_if_needed()
        # Assert: Booking confirmation displays the 'Yol tarifi al (Google Maps)' link.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/a").nth(0)).to_be_visible(timeout=15000), "Booking confirmation displays the 'Yol tarifi al (Google Maps)' link."
        # Assert: Booking confirmation displays the total price '₺850'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[4]/span[2]").nth(0)).to_have_text("\u20ba850", timeout=15000), "Booking confirmation displays the total price '\u20ba850'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    