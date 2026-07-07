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
        
        # -> Navigate to the demo booking page by opening /book/demo (the public booking page).
        await page.goto("http://localhost:3000/book/demo")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Select the 'Saç kesimi & şekillendirme' service (if not already) and click the 'Devam et' button to proceed to the 'Personel' step.
        # Saç kesimi & şekillendirme 45m · ₺200 depozito... button
        elem = page.get_by_role('button', name='Saç kesimi & şekillendirme 45m · ₺200 depozito ₺850', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Saç kesimi & şekillendirme' service (if not already) and click the 'Devam et' button to proceed to the 'Personel' step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the 'Selin Aydın' staff member from the Personel list so the UI can proceed.
        # SA Selin Aydın Kıdemli stilist button
        elem = page.get_by_role('button', name='SA Selin Aydın Kıdemli stilist', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Devam et' button to proceed to the 'Tarih & Saat' (Date & Time) step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00' time slot and then click the 'Devam et' button to proceed to the confirmation/contact details step.
        # 09:00 button
        elem = page.get_by_role('button', name='09:00', exact=True)
        await elem.click(timeout=10000)
        
        # -> Select the '09:00' time slot and then click the 'Devam et' button to proceed to the confirmation/contact details step.
        # Devam et button
        elem = page.get_by_role('button', name='Devam et', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Adınız Soyadınız' and 'Telefon' fields, check the SMS consent box, then click the 'Randevuyu onayla' (Confirm appointment) button.
        # Adınız Soyadınız text field
        elem = page.get_by_placeholder('Adınız Soyadınız', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Test User")
        
        # -> Fill the 'Adınız Soyadınız' and 'Telefon' fields, check the SMS consent box, then click the 'Randevuyu onayla' (Confirm appointment) button.
        # +90 5xx xxx xx xx tel field
        elem = page.get_by_placeholder('+90 5xx xxx xx xx', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("+90 532 000 0000")
        
        # -> Fill the 'Adınız Soyadınız' and 'Telefon' fields, check the SMS consent box, then click the 'Randevuyu onayla' (Confirm appointment) button.
        # SMS hatırlatmaları almak istiyorum (6563 sayılı...
        elem = page.locator('xpath=/html/body/div[2]/div/main/div/div[2]/div[2]/label')
        await elem.click(timeout=10000)
        
        # -> Fill the 'Adınız Soyadınız' and 'Telefon' fields, check the SMS consent box, then click the 'Randevuyu onayla' (Confirm appointment) button.
        # Randevuyu onayla button
        elem = page.get_by_role('button', name='Randevuyu onayla', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify a booking confirmation is displayed
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: Booking confirmation page shows a visible 'Yeni randevu al' button.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0)).to_be_visible(timeout=15000), "Booking confirmation page shows a visible 'Yeni randevu al' button."
        # Assert: Booking confirmation displays the total price '₺850'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[5]/span[2]").nth(0)).to_have_text("\u20ba850", timeout=15000), "Booking confirmation displays the total price '\u20ba850'."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[2]/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: Booking confirmation displays the 'Personel' section.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[2]/span[1]").nth(0)).to_be_visible(timeout=15000), "Booking confirmation displays the 'Personel' section."
        
        # --> Verify the booked appointment is shown in the success state
        # Assert: The confirmation shows the total price ₺850.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[5]/span[2]").nth(0)).to_have_text("\u20ba850", timeout=15000), "The confirmation shows the total price \u20ba850."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0).scroll_into_view_if_needed()
        # Assert: A 'Yeni randevu al' button is visible on the confirmation page.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/button").nth(0)).to_be_visible(timeout=15000), "A 'Yeni randevu al' button is visible on the confirmation page."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[1]/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The confirmation page shows the 'Hizmet' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[1]/span[1]").nth(0)).to_be_visible(timeout=15000), "The confirmation page shows the 'Hizmet' label."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[2]/span[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The confirmation page shows the 'Personel' label.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div[2]/div[2]/span[1]").nth(0)).to_be_visible(timeout=15000), "The confirmation page shows the 'Personel' label."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    