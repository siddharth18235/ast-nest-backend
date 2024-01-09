// weather-update.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WeatherService {
  async getWeatherUpdate(location: string): Promise<string> {
    const apiKey = '59398767bf45139742ec1ced853f4ad4';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      const weatherData = response.data;

      // Extract relevant information from weatherData
      const temperature = weatherData.main.temp;
      const description = weatherData.weather[0].description;

      return `Weather Update in ${location}: Temperature is ${(temperature-273.15).toFixed(2)}°C. ${description}.`;
    } catch (error) {
      console.error('Error fetching weather update:', error.message);
      return 'Unable to fetch weather update at the moment.';
    }
  }
}
