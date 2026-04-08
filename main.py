import requests
from rich import print
from datetime import datetime

def display_temperature(day, temperature, unit='F'):
  """Displays a temperature with day"""
  print(f"[yellow]{day}[/yellow] is {round(temperature)}°{unit}.")

def display_current_weather(city):
  """Displays the current weather"""
  api_key = "a08f0oc3b4t11e51a8dbab6fef7e5923"
  api_url = f"https://api.shecodes.io/weather/v1/current?query={city}&key={api_key}&units=imperial"
  
  response = requests.get(api_url)
  current_weather_data = response.json()
  current_weather_city = current_weather_data ['city']
  current_weather_temperature = current_weather_data ['temperature']['current']

  display_temperature("Today", round(current_weather_temperature))


def display_forecast_weather(city_name):
  """Displays weather forecast of a city"""
  api_key = "a08f0oc3b4t11e51a8dbab6fef7e5923"
  api_url = f"https://api.shecodes.io/weather/v1/forecast?query={city_name}&key={api_key}&units=imperial"

  response = requests.get(api_url)
  forecast_weather_data = response.json()
  #print (forecast_weather_data)
  print("\n[purple bold]Forecast:[/purple bold]")
  for day in forecast_weather_data['daily']:
    timestamp = day['time']
    date = datetime.fromtimestamp(timestamp)
    #print (date)
    formatted_day = date.strftime("%A")
    #print (formatted_day)
    temperature = day['temperature']['day']
    
    if date.date() != datetime.today().date():
      display_temperature(f"[yellow]{formatted_day}[/yellow]", round(temperature))
    
    #print(f"Today in {city_name} is {temperature}°F.").date()
def credit ():
  """Displays credit"""
  print ("\n[blue]This app was built by Karen Berglund[/blue]")

def welcome ():
  """Displays welcome message"""
  print ("[red bold]Welcome to my Weather App![/red bold]")


welcome ()
city_name = input("Please enter your city:")
city_name = city_name.strip()

if city_name:
  display_current_weather(city_name)
  display_forecast_weather(city_name)
  credit()
  
else:
  print("Please try again.")