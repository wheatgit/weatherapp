// Visual Crossing API configuration
const API_KEY = 'THM84QNBNTNGPR6DM97DSB2ZL'; // You'll need to replace this with your actual API key
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Function to fetch weather data for a location
async function fetchWeatherData(location) {
    try {
        const response = await fetch(`${BASE_URL}/${encodeURIComponent(location)}?unitGroup=us&include=current&key=${API_KEY}&contentType=json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Weather data for', location, ':', data);
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

// Function to process the raw API data and extract only needed information
function processWeatherData(rawData) {
    try {
        const currentConditions = rawData.currentConditions;
        const location = rawData.resolvedAddress || rawData.address;
        
        const processedData = {
            location: location,
            temperature: currentConditions.temp,
            feelsLike: currentConditions.feelslike,
            humidity: currentConditions.humidity,
            windSpeed: currentConditions.windspeed,
            description: currentConditions.conditions,
            icon: currentConditions.icon
        };
        
        console.log('Processed weather data:', processedData);
        return processedData;
    } catch (error) {
        console.error('Error processing weather data:', error);
        throw error;
    }
}

// Function to display location and temperature
function displayWeather(weatherData) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    
    weatherDisplay.innerHTML = `
        <div class="weather-card">
            <h2 class="location">${weatherData.location}</h2>
            <div class="temperature">${weatherData.temperature}°F</div>
            <div class="description">${weatherData.description}</div>
            <div class="details">
                <div class="detail-item">
                    <span class="label">Feels Like:</span>
                    <span class="value">${weatherData.feelsLike}°F</span>
                </div>
                <div class="detail-item">
                    <span class="label">Humidity:</span>
                    <span class="value">${weatherData.humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Wind Speed:</span>
                    <span class="value">${weatherData.windSpeed} mph</span>
                </div>
            </div>
        </div>
    `;
}

// Form event listener
document.getElementById('weatherForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const location = document.getElementById('locationInput').value.trim();
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    try {
        const rawWeatherData = await fetchWeatherData(location);
        const processedWeatherData = processWeatherData(rawWeatherData);
        displayWeather(processedWeatherData);
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data. Please try again.');
    }
});
