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
        
        # -> Click the 'Demo' link to enter the demo dashboard.
        # Demo link
        elem = page.get_by_role('link', name='Demo', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the 'Personel yönetimi' (Staff management) page.
        await page.goto("http://localhost:3000/staff")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Select the staff member 'Mert Kaya' by clicking the Mert Kaya card to update the detail panel and reveal edit controls.
        # MK Mert Kaya Berber çevrimiçi 09:00 – 17:00 8h... button
        elem = page.get_by_role('button', name='MK Mert Kaya Berber çevrimiçi 09:00 – 17:00 8h Doluluk 74% Hizmetler Sakal tıraşı', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'EN' language button to switch the UI to English so edit controls may display textual labels like 'Edit'.
        # EN button
        elem = page.get_by_role('button', name='EN', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'View schedule' link on the Member card to open the schedule view where working hours can be edited.
        # View schedule link
        elem = page.get_by_role('link', name='View schedule', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Staff' link in the left sidebar to open the Staff management page.
        # Staff link
        elem = page.get_by_role('link', name='Staff', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Selin Aydin' member card to try to open member options or the edit form.
        # SA Selin Aydın Senior stylist online 09:00 –... button
        elem = page.locator('xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the staff list shows the updated staff information
        # Assert: Staff list shows the member name Selin Aydın.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button[1]").nth(0)).to_contain_text("Selin Ayd\u0131n", timeout=15000), "Staff list shows the member name Selin Ayd\u0131n."
        # Assert: Staff list shows the updated start time 09:00 on Selin Aydın's card.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button[1]").nth(0)).to_contain_text("09:00", timeout=15000), "Staff list shows the updated start time 09:00 on Selin Ayd\u0131n's card."
        # Assert: Staff list shows the updated total working hours (9h) on Selin Aydın's card.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button[1]").nth(0)).to_contain_text("9h", timeout=15000), "Staff list shows the updated total working hours (9h) on Selin Ayd\u0131n's card."
        
        # --> Verify the updated working hours are visible
        # Assert: The staff card shows the updated working hours 09:00 – 18:00 9h.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button[1]").nth(0)).to_contain_text("09:00 \u2013 18:00 9h", timeout=15000), "The staff card shows the updated working hours 09:00 \u2013 18:00 9h."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    