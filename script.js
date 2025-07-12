// Visual Crossing API configuration
const API_KEY = 'THM84QNBNTNGPR6DM97DSB2ZL'; // You'll need to replace this with your actual API key
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

// Function to fetch weather data for a location
async function fetchWeatherData(location) {
    try {
        const response = await fetch(`${BASE_URL}/${encodeURIComponent(location)}?unitGroup=metric&include=current&key=${API_KEY}&contentType=json`);
        
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
