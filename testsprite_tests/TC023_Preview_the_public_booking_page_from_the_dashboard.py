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
        
        # -> Open the Booking page by navigating to '/booking' to access the booking preview.
        await page.goto("http://localhost:3000/booking")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Saç kesimi & şekillendirme' button in the live preview to inspect the booking selection and confirm time-slot and CTA behavior.
        # Saç kesimi & şekillendirme 45m ₺850 button
        elem = page.get_by_role('button', name='Saç kesimi & şekillendirme 45m ₺850', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the public booking page preview is displayed
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[1]/span[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The live preview 'canlı' badge is visible.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[1]/span[2]").nth(0)).to_be_visible(timeout=15000), "The live preview 'canl\u0131' badge is visible."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[1]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The service 'Saç kesimi & şekillendirme' is visible in the booking preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[1]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "The service 'Sa\u00e7 kesimi & \u015fekillendirme' is visible in the booking preview."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[2]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: A time-slot button '09:00' is visible in the booking preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[2]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "A time-slot button '09:00' is visible in the booking preview."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: The booking action button 'Rezervasyonu tamamla' is visible in the preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/button").nth(0)).to_be_visible(timeout=15000), "The booking action button 'Rezervasyonu tamamla' is visible in the preview."
        
        # --> Verify the booking experience layout is visible
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[1]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: The service 'Saç kesimi & şekillendirme' is visible in the booking preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[1]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "The service 'Sa\u00e7 kesimi & \u015fekillendirme' is visible in the booking preview."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[2]/div/button[1]").nth(0).scroll_into_view_if_needed()
        # Assert: A booking time slot '09:00' is visible in the booking preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/div[2]/div/button[1]").nth(0)).to_be_visible(timeout=15000), "A booking time slot '09:00' is visible in the booking preview."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/button").nth(0).scroll_into_view_if_needed()
        # Assert: The booking action button 'Rezervasyonu tamamla' is visible in the booking preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[3]/div[2]/div/div[2]/button").nth(0)).to_be_visible(timeout=15000), "The booking action button 'Rezervasyonu tamamla' is visible in the booking preview."
        await page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[1]/span[2]").nth(0).scroll_into_view_if_needed()
        # Assert: The 'canlı' (live) badge is visible on the booking preview.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div[1]/span[2]").nth(0)).to_be_visible(timeout=15000), "The 'canl\u0131' (live) badge is visible on the booking preview."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    