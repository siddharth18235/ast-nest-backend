import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherModule } from './weather/weather.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://Siddharth999:siddharth999@cluster0.wmel5.mongodb.net/?retryWrites=true&w=majority'),
    UserModule,
    WeatherModule,
    TelegramBotModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
