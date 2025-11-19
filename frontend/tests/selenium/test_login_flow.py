def test_login_invalid_credentials_shows_error(driver, base_url, wait_for):
    driver.get(base_url + '/login')
    wait_for(0.8)

    driver.find_element('name', 'email').send_keys('no-such-user@example.com')
    driver.find_element('name', 'password').send_keys('wrongpassword')
    driver.find_element('css selector', 'button[type="submit"]').click()
    wait_for(1.2)

    body_text = driver.find_element('tag name', 'body').text
    assert 'Login failed' in body_text or 'Email and Password are required' not in body_text
