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
        
        # -> Navigate to the Services page (open /services) so the service creation UI can be accessed.
        await page.goto("http://localhost:3000/services")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Hizmet ekle' button to open the Add Service form.
        # Hizmet ekle button
        elem = page.get_by_role('button', name='Hizmet ekle', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Hizmet adı' field with a unique name, set duration and price, select a color, and click the 'Hizmeti ekle' (Add service) button to save the service.
        # örn. Saç kesimi text field
        elem = page.locator('[id="sf-name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Automated Test Service 2026-07-07")
        
        # -> Fill the 'Hizmet adı' field with a unique name, set duration and price, select a color, and click the 'Hizmeti ekle' (Add service) button to save the service.
        # number field
        elem = page.locator('[id="sf-dur"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("60")
        
        # -> Fill the 'Hizmet adı' field with a unique name, set duration and price, select a color, and click the 'Hizmeti ekle' (Add service) button to save the service.
        # number field
        elem = page.locator('[id="sf-price"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("750")
        
        # -> Fill the 'Hizmet adı' field with a unique name, set duration and price, select a color, and click the 'Hizmeti ekle' (Add service) button to save the service.
        # Saç button
        elem = page.get_by_role('button', name='Saç', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Hizmet adı' field with a unique name, set duration and price, select a color, and click the 'Hizmeti ekle' (Add service) button to save the service.
        # Hizmeti ekle button
        elem = page.get_by_role('button', name='Hizmeti ekle', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the new service appears in the list
        # Assert: The new service name 'Automated Test Service 2026-07-07' is visible in the services list.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[1]/div/div/p[1]").nth(0)).to_have_text("Automated Test Service 2026-07-07", timeout=15000), "The new service name 'Automated Test Service 2026-07-07' is visible in the services list."
        # Assert: The new service displays the selected category 'hair'.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[1]/div/div/p[2]").nth(0)).to_have_text("hair", timeout=15000), "The new service displays the selected category 'hair'."
        # Assert: The new service's duration is shown as '1h' in the list.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[2]").nth(0)).to_have_text("1h", timeout=15000), "The new service's duration is shown as '1h' in the list."
        # Assert: The new service's price is displayed as '₺750' in the list.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[3]/div/table/tbody/tr[8]/td[5]").nth(0)).to_have_text("\u20ba750", timeout=15000), "The new service's price is displayed as '\u20ba750' in the list."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    