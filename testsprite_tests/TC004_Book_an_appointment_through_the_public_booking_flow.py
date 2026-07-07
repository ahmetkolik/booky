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
        
        # -> Open the demo booking page by navigating to '/book/demo' and prepare to interact with the service selection UI.
        await page.goto("http://localhost:3000/book/demo")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the service card labeled 'Saç kesimi & şekillendirme' to ensure the desired service is selected.
        # Saç kesimi & şekillendirme 45m · ₺200 depozito... button
        elem = page.get_by_role('button', name='Saç kesimi & şekillendirme 45m · ₺200 depozito ₺850', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Devam et' button to proceed to the Personel (staff) selection step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the staff member labeled 'Selin Aydın' to select them and enable continuing the booking
        # SA Selin Aydın Kıdemli stilist button
        elem = page.get_by_role('button', name='SA Selin Aydın Kıdemli stilist', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Devam et' button to proceed to the Tarih & Saat (Date & Time) step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the date button labeled 'Sal 7' (Tuesday, 7) to set the booking date.
        # Sal 7 button
        elem = page.get_by_role('button', name='Sal 7', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '09:00' time slot to choose an available appointment time.
        # 09:00 button
        elem = page.get_by_role('button', name='09:00', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Devam et' button to proceed to the confirmation/customer details step
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid phone number, then click the 'Randevuyu onayla' button to confirm the booking.
        # Adınız Soyadınız text field
        elem = page.get_by_placeholder('Adınız Soyadınız', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User 2026-07-07 09:00")
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid phone number, then click the 'Randevuyu onayla' button to confirm the booking.
        # +90 5xx xxx xx xx tel field
        elem = page.get_by_placeholder('+90 5xx xxx xx xx', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("+905321234567")
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid phone number, then click the 'Randevuyu onayla' button to confirm the booking.
        # SMS hatırlatmaları almak istiyorum (6563 sayılı...
        elem = page.locator('xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/label')
        await elem.click(timeout=10000)
        
        # -> Fill the 'Adınız Soyadınız' field with a unique name and the 'Telefon' field with a valid phone number, then click the 'Randevuyu onayla' button to confirm the booking.
        # Randevuyu onayla button
        elem = page.get_by_role('button', name='Randevuyu onayla', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify a booking confirmation screen is visible
        # Assert: The booking confirmation shows the 'Hizmet' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[1]/span[1]").nth(0)).to_have_text("Hizmet", timeout=15000), "The booking confirmation shows the 'Hizmet' label."
        # Assert: The booking confirmation shows the 'Personel' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[2]/span[1]").nth(0)).to_have_text("Personel", timeout=15000), "The booking confirmation shows the 'Personel' label."
        # Assert: The booking confirmation displays the total price '₺850'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[5]/span[2]").nth(0)).to_have_text("\u20ba850", timeout=15000), "The booking confirmation displays the total price '\u20ba850'."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: The 'Yeni randevu al' button is visible on the confirmation screen.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0)).to_be_visible(timeout=15000), "The 'Yeni randevu al' button is visible on the confirmation screen."
        
        # --> Verify the appointment is shown as confirmed
        # Assert: The booking summary displays the 'Hizmet' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[1]/span[1]").nth(0)).to_have_text("Hizmet", timeout=15000), "The booking summary displays the 'Hizmet' label."
        # Assert: The booking summary displays the 'Personel' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[2]/span[1]").nth(0)).to_have_text("Personel", timeout=15000), "The booking summary displays the 'Personel' label."
        # Assert: The booking summary shows the total price ₺850.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[5]/span[2]").nth(0)).to_have_text("\u20ba850", timeout=15000), "The booking summary shows the total price \u20ba850."
        # Assert: The booking summary displays the 'Adres' section.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[4]/span[1]").nth(0)).to_have_text("Adres", timeout=15000), "The booking summary displays the 'Adres' section."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    