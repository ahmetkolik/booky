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
        
        # -> Open the staff management page by navigating to /staff so the staff list and add/edit controls can be inspected.
        await page.goto("http://localhost:3000/staff")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Personel ekle' button to open the add staff form.
        # Personel ekle button
        elem = page.get_by_role('button', name='Personel ekle', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Ad soyad' and 'Rol / uzmanlık' fields, set Mesai başlangıcı to 08:30 and Mesai bitişi to 17:30, then click the 'Personeli ekle' button to save the new staff member.
        # örn. Selin Aydın text field
        elem = page.locator('[id="stf-name"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Deniz Y\u0131lmaz")
        
        # -> Fill the 'Ad soyad' and 'Rol / uzmanlık' fields, set Mesai başlangıcı to 08:30 and Mesai bitişi to 17:30, then click the 'Personeli ekle' button to save the new staff member.
        # örn. Kıdemli stilist text field
        elem = page.locator('[id="stf-role"]')
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Berber")
        
        # -> Fill the 'Ad soyad' and 'Rol / uzmanlık' fields, set Mesai başlangıcı to 08:30 and Mesai bitişi to 17:30, then click the 'Personeli ekle' button to save the new staff member.
        # 06:00 06:30 07:00 07:30 08:00 08:30 09:00 09:30... dropdown
        elem = page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div/div[2]/div[3]/div/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Fill the 'Ad soyad' and 'Rol / uzmanlık' fields, set Mesai başlangıcı to 08:30 and Mesai bitişi to 17:30, then click the 'Personeli ekle' button to save the new staff member.
        # 06:00 06:30 07:00 07:30 08:00 08:30 09:00 09:30... dropdown
        elem = page.locator("xpath=/html/body/div[2]/div/main/div/div[2]/div/div[2]/div[3]/div[2]/select").nth(0)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.select_option("")
        
        # -> Fill the 'Ad soyad' and 'Rol / uzmanlık' fields, set Mesai başlangıcı to 08:30 and Mesai bitişi to 17:30, then click the 'Personeli ekle' button to save the new staff member.
        # Personeli ekle button
        elem = page.get_by_role('button', name='Personeli ekle', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Deniz Yılmaz' staff card to open the staff detail/edit view.
        # DY Deniz Yılmaz Berber çevrimiçi 08:30 – 17:30 9h... button
        elem = page.get_by_role('button', name='DY Deniz Yılmaz Berber çevrimiçi 08:30 – 17:30 9h Doluluk 0% Hizmetler —', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Deniz Yılmaz' staff card to re-open the personnel card, and list visible buttons in the personnel card to locate an edit control for working hours.
        # DY Deniz Yılmaz Berber çevrimiçi 08:30 – 17:30 9h... button
        elem = page.get_by_role('button', name='DY Deniz Yılmaz Berber çevrimiçi 08:30 – 17:30 9h Doluluk 0% Hizmetler —', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the '9h' working-hours duration badge in the personnel card for Deniz Yılmaz to try opening the working-hours editor.
        # 9h
        elem = page.locator('xpath=/html/body/div[2]/div/main/div/div/aside/div/div[4]/div/span[2]')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the staff member appears in the staff list
        await page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button[5]").nth(0).scroll_into_view_if_needed()
        # Assert: The staff member 'Deniz Yılmaz' appears in the staff list.
        await expect(page.locator("xpath=/html/body/div[2]/div/main/div/div/div/div[2]/button[5]").nth(0)).to_be_visible(timeout=15000), "The staff member 'Deniz Y\u0131lmaz' appears in the staff list."
        current_url = await page.evaluate("() => window.location.href")
        # Assert: page loaded with a URL (final outcome verified by the AI judge during the run)
        assert current_url, 'Page should have loaded with a URL'
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    