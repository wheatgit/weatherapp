const API_KEY = 'THM84QNBNTNGPR6DM97DSB2ZL';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

const OPENCAGE_API_KEY = 'c877ae3eb0604def802660d527e999f1'; 
const OPENCAGE_URL = 'https://api.opencagedata.com/geocode/v1/json';

function initializeAutocomplete() {
    const input = document.getElementById('locationInput');
    let timeoutId;
    
    input.addEventListener('input', function() {
        clearTimeout(timeoutId);
        const query = input.value.trim();
        
        if (query.length < 3) {
            hideSuggestions();
            return;
        }
        
        timeoutId = setTimeout(() => {
            searchLocations(query);
        }, 300);
    });
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !document.getElementById('suggestions').contains(e.target)) {
            hideSuggestions();
        }
    });
}

async function searchLocations(query) {
    try {
        const response = await fetch(`${OPENCAGE_URL}?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=5&no_annotations=1`);
        const data = await response.json();
        
        if (data.results) {
            showSuggestions(data.results);
        }
    } catch (error) {
        console.error('Error searching locations:', error);
    }
}

function showSuggestions(results) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = result.formatted;
        div.addEventListener('click', () => {
            document.getElementById('locationInput').value = result.formatted;
            hideSuggestions();
        });
        suggestionsDiv.appendChild(div);
    });
    
    suggestionsDiv.style.display = 'block';
}

function hideSuggestions() {
    document.getElementById('suggestions').style.display = 'none';
}

function showLoading() {
    console.log('Showing loading...');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('weatherDisplay').innerHTML = '';
}

function hideLoading() {
    console.log('Hiding loading...');
    document.getElementById('loading').classList.add('hidden');
}

async function fetchWeatherData(location) {
    try {
        const response = await fetch(`${BASE_URL}/${encodeURIComponent(location)}/next5days?unitGroup=us&include=current&key=${API_KEY}&contentType=json`);
        
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

function processWeatherData(rawData) {
    try {
        const currentConditions = rawData.currentConditions;
        const location = rawData.resolvedAddress || rawData.address;
        const days = rawData.days;
        
        const processedData = {
            location: location,
            temperature: currentConditions.temp,
            feelsLike: currentConditions.feelslike,
            humidity: currentConditions.humidity,
            windSpeed: currentConditions.windspeed,
            description: currentConditions.conditions,
            icon: currentConditions.icon,
            forecast: days.slice(1, 6).map(day => ({
                date: new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                temp: day.temp,
                description: day.conditions,
                icon: day.icon
            }))
        };
        
        console.log('Processed weather data:', processedData);
        return processedData;
    } catch (error) {
        console.error('Error processing weather data:', error);
        throw error;
    }
}

function getWeatherIcon(description) {
    const weatherIcons = {
        'clear': 'wi-day-sunny',
        'partly-cloudy-day': 'wi-day-cloudy',
        'cloudy': 'wi-cloudy',
        'rain': 'wi-rain',
        'snow': 'wi-snow',
        'fog': 'wi-fog',
        'wind': 'wi-windy',
        'thunderstorm': 'wi-thunderstorm',
        'drizzle': 'wi-sprinkle',
        'showers': 'wi-showers',
        'overcast': 'wi-cloudy',
        'mist': 'wi-fog',
        'haze': 'wi-haze'
    };
    
    const lowerDesc = description.toLowerCase();
    for (const [key, icon] of Object.entries(weatherIcons)) {
        if (lowerDesc.includes(key)) {
            return icon;
        }
    }
    
    return 'wi-day-cloudy';
}

function displayWeather(weatherData) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    const weatherIcon = getWeatherIcon(weatherData.description);
    
    const forecastHTML = weatherData.forecast.map(day => `
        <div class="forecast-card">
            <div class="forecast-date">${day.date}</div>
            <i class="wi ${getWeatherIcon(day.description)} forecast-icon"></i>
            <div class="forecast-temp">${day.temp}°F</div>
            <div class="forecast-desc">${day.description}</div>
        </div>
    `).join('');
    
    weatherDisplay.innerHTML = `
        <div class="weather-card">
            <h2 class="location">${weatherData.location}</h2>
            <div class="weather-main">
                <i class="wi ${weatherIcon} weather-icon"></i>
                <div class="temperature">${weatherData.temperature}°F</div>
            </div>
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
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
}

document.getElementById('weatherForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const location = document.getElementById('locationInput').value.trim();
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    showLoading();
    
    try {
        const rawWeatherData = await fetchWeatherData(location);
        const processedWeatherData = processWeatherData(rawWeatherData);
        displayWeather(processedWeatherData);
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching weather data. Please try again.');
    } finally {
        hideLoading();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    initializeAutocomplete();
});
