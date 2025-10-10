import os
import re
import sys
import time
from datetime import date, timedelta

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options

BASE_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
LOGIN_EMAIL = os.getenv("PATIENT_EMAIL", "testuser2@example.com")
LOGIN_PASSWORD = os.getenv("PATIENT_PASSWORD", "Test@123")
PATIENT_ID = os.getenv("PATIENT_ID", "P123")
DEPARTMENT = os.getenv("DEPARTMENT", "Cardiology")
DOCTOR_NAME = os.getenv("DOCTOR_NAME", "Dr. Alice Smith")
DATE_OFFSET_DAYS = int(os.getenv("DATE_OFFSET_DAYS", "31"))
TIME_SLOT = os.getenv("TIME_SLOT", "11:00")
REASON = os.getenv("REASON", "Selenium E2E booking")


def main():
    chrome_options = Options()
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1280,900")

    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    wait = WebDriverWait(driver, 25)

    try:
        driver.get(f"{BASE_URL}/login?redirect=/patient/book-appointment")

        wait.until(EC.presence_of_element_located((By.NAME, "email")))
        driver.find_element(By.NAME, "email").send_keys(LOGIN_EMAIL)
        driver.find_element(By.NAME, "password").send_keys(LOGIN_PASSWORD)
        driver.find_element(By.XPATH, "//button[@type='submit' and contains(.,'Login')]").click()

        wait.until(EC.url_contains("/patient/book-appointment"))

        # Ensure patientId exists in localStorage
        driver.execute_script(f"localStorage.setItem('patientId', '{PATIENT_ID}')")
        driver.refresh()

        dept_select_el = wait.until(EC.presence_of_element_located((
            By.XPATH, "//label[contains(.,'Select Department')]/following::select[1]"
        )))
        Select(dept_select_el).select_by_visible_text(DEPARTMENT)

        doctor_select_el = wait.until(EC.presence_of_element_located((By.NAME, "doctorId")))
        # Wait for options to populate
        wait.until(lambda d: len(doctor_select_el.find_elements(By.TAG_NAME, "option")) > 1)
        doctor_select = Select(doctor_select_el)

        matched = False
        for opt in doctor_select.options:
            if DOCTOR_NAME in opt.text:
                doctor_select.select_by_visible_text(opt.text)
                matched = True
                break
        if not matched:
            for opt in doctor_select.options:
                if opt.get_attribute("value"):
                    doctor_select.select_by_value(opt.get_attribute("value"))
                    matched = True
                    break
        assert matched, "No suitable doctor option found"

        appt_date = (date.today() + timedelta(days=DATE_OFFSET_DAYS)).strftime("%Y-%m-%d")
        date_input = wait.until(EC.presence_of_element_located((By.NAME, "date")))
        date_input.clear()
        date_input.send_keys(appt_date)

        time_select_el = driver.find_element(By.NAME, "time")
        Select(time_select_el).select_by_value(TIME_SLOT)

        try:
            reason_el = driver.find_element(By.NAME, "reason")
            reason_el.clear()
            reason_el.send_keys(REASON)
        except Exception:
            pass

        driver.find_element(By.XPATH, "//button[@type='submit' and contains(.,'Book Appointment')]").click()

        msg_el = wait.until(EC.visibility_of_element_located((
            By.XPATH, "//*[contains(text(),'Appointment booked successfully')]"
        )))
        text = msg_el.text
        print("Confirmation:", text)
        if "Appointment booked successfully" not in text:
            raise AssertionError("Booking confirmation not found")

        m = re.search(r"ID is (\S+)", text)
        if m:
            print("AppointmentId:", m.group(1))

        print("E2E PASS")
    except Exception as e:
        print("E2E FAIL:", str(e))
        raise
    finally:
        time.sleep(1)
        driver.quit()


if __name__ == "__main__":
    sys.exit(main())
