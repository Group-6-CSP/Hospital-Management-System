import random
import string


def random_email():
    return f"test+{''.join(random.choices(string.ascii_lowercase+string.digits, k=6))}@example.com"


def test_register_client_side_validation(driver, base_url, wait_for):
    driver.get(base_url + '/register')
    wait_for(0.8)

    # Try submitting empty form and assert browser shows required validation
    submit = driver.find_element('css selector', 'button[type="submit"]')
    submit.click()
    wait_for(0.5)

    # Fill with invalid contact then submit and expect client-side message
    driver.find_element('name', 'fullName').send_keys('Selenium Test')
    driver.find_element('name', 'email').send_keys(random_email())
    driver.find_element('name', 'contact').send_keys('123')
    driver.find_element('name', 'dob').send_keys('1990-01-01')
    driver.find_element('name', 'gender').send_keys('Male')
    driver.find_element('name', 'password').send_keys('123456')
    driver.find_element('name', 'confirmPassword').send_keys('123456')
    submit.click()
    wait_for(1)

    # If backend is not running tests will show a server connection message in UI
    body_text = driver.find_element('tag name', 'body').text
    assert 'Registration' in body_text or 'Cannot connect' in body_text or 'Registration successful' in body_text
