import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)



url = "https://ofertadecursos.uniandes.edu.co/"

driver = webdriver.Chrome(options=chrome_options)
driver.set_page_load_timeout(10)
driver.get(url)

time.sleep(5)

xpath = "//*[@id='g-recaptcha']/div/div/iframe"

driver.implicitly_wait(10)

driver.find_element(By.XPATH, xpath).click()

time.sleep(3)

#xpath para el dropdown list de departamentos
xpath = "//*[@id='programa']"
driver.find_element(By.XPATH, xpath).click()

time.sleep(2)
dpto = "//*[@id='programa']/option[75]"
driver.find_element(By.XPATH, dpto).click()

button = "//*[@id='sidebar-wrapper']/div[2]/form/button[1]"
driver.find_element(By.XPATH, button).click()

#-----------------------------------------------

driver.implicitly_wait(10)

# Find all elements with the class "card"

card_list = []

#xpath del boton para cambiar de pagina
sig = "//*[@id='wrapper']/div[2]/div/nav/ul/li[5]/button"

while True:
    # Wait for the cards to be present
    driver.implicitly_wait(10)

    cards = driver.find_elements(By.CLASS_NAME, "card")
    
    # Extract data from each card and store it
    for card in cards:
        card_text = card.text
        
        # Store the card data in the list
        card_list.append({
            'text': card_text
        })
    
    # Try to locate the "Next" button and click it
    try:
        next_button = driver.find_element(By.XPATH, sig)
        
        # Check if the button is enabled/clickable
        if "disabled" in next_button.get_attribute("class"):
            print("Next button is disabled. End of pages.")
            break  
        
        # Click the "Next" button to go to the next page
        next_button.click()
        print("Navigating to the next page...")
        #  wait for the new page to load completely
        WebDriverWait(driver, 10).until(EC.staleness_of(cards[0]))
    except Exception as e:
        print("No more pages or unable to find the next button. Stopping.", e)
        break  # Exit the loop if the "Next" button is not found

formatted_list = []


for i in card_list:
    lines = i['text'].split("\n")

    formatted_data = {
    'Course Code': lines[0].split()[0],
    'Course Name': ' '.join(lines[0].split()[1:]),
    'Cupo': lines[2].strip(),
    'NRC': lines[3].split(": ")[1],
    'Sección': lines[4].split(": ")[1],
    'Créditos': lines[5].split(": ")[1],
    'Periodo': lines[6].split(": ")[1],
    'Parte de Periodo': lines[7].split(": ")[1],
    'Instructor Principal': lines[8].split(": ")[1],
    'Días y Horas': lines[10].strip(),
    'Fecha Inicio': lines[11].strip(),
    'Fecha Fin': lines[12].strip(),
    'Edificio': lines[13].strip(),
    'Cupos Ofrecidos': lines[-1].split()[1],
    'Cupos Inscritos': lines[-1].split()[2],
    'Cupos Disponibles': lines[-1].split()[3]
    }
    formatted_list.append(formatted_data)


driver.quit()

# Write the data to a JSON file
with open("formatted_cards_data.json", mode='w', encoding='utf-8') as file:
    json.dump(formatted_list, file, indent=4, ensure_ascii=False)

with open("no_formatted_cards_data.json", mode='w', encoding='utf-8') as file:
    json.dump(card_list, file, indent=4, ensure_ascii=False)

print(f"Data successfully written to 'formatted_cards_data.json'. Total cards: {len(formatted_list)}")