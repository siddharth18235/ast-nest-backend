import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Module({
    imports:[],
    providers:[WeatherService]
})
export class WeatherModule {}
