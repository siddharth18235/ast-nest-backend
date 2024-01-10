import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherService } from '../weather/weather.service';


const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramBotService { 
  private readonly bot: any
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly weatherUpdateService: WeatherService,
  ) {
    this.bot = new TelegramBot('6559691270:AAEN2AwtYSIIkWa0_l6iYAy-r8XhqWkS3Dg',{polling:true})

    this.setupListeners()
  }

  private async sendMessage(msg:any,text:string){
    const chatId = msg.chat.id
      await this.bot.sendMessage(chatId,text);
  }

  private setupListeners(){
    this.bot.onText(/\/start/,async (msg:any) => {
      await this.sendMessage(msg,'Welcome!')
    })

    this.bot.onText(/\/help/,async (msg:any) => {
      await this.sendMessage(msg,'Send me a sticker!')
    })

    this.bot.onText(/\/unsubscribe/,async (msg:any) => {
      await this.unsubscribeUser(msg)
    })

    this.bot.onText(/\/updatelocation/,async (msg:any) => {
      await this.updateLocation(msg)
    })

    this.bot.onText(/\/subscribe/,async (msg:any) => {
      await this.subscribeUser(msg)
    })

    this.bot.onText(/\/getweatherupdate/,async (msg:any) => {
      await this.getUpdate(msg)
    })

    this.bot.on('sticker',async (msg:any) => {
      await this.sendMessage(msg,'👍')
    })

    this.bot.on('message',async (msg:any) => {
      await this.sendMessage(msg,'Hey there!')
    })
  }
  async unsubscribeUser(msg:any) {
    const telegramId = msg.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (existingUser) {
        await this.userModel.findOneAndUpdate(
          { telegram_id: telegramId },
          {
            subscribed: false,
          },
        );
        this.sendMessage(msg,
          'Bye bye! You have been un-subscribed for daily weather updates.',
        );
      } else {
        await this.sendMessage(msg,'You are not subscribed for daily weather updates.');
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await this.sendMessage(msg,
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }
  
  async updateLocation(msg:any){
    const telegramId = msg.from.id;
    const message = msg.text
    try {
      // Check if the user is present and subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (!existingUser || !existingUser.subscribed) {
        await this.sendMessage(msg,'You are not subscribed for daily weather updates.');
      }else{
        const regex = /^\/updatelocation\s(.+)$/;
        const match = message.match(regex);
        if(match){
          const location = match[1];
          await this.userModel.findOneAndUpdate(
            { telegram_id: telegramId },
            {
              location:location
            },
          );
          await this.sendMessage(msg,
            `You will now receive location updates from ${location}`,
          );
          return
        }else{
          this.sendMessage(msg,'Please provide a location to subscribe.');
          return;
        }
      }
    }catch(error){
      console.error('Error subscribing user:', error);
      await this.sendMessage(msg,
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }
  
  async subscribeUser(msg:any) {
    const telegramId = msg.from.id;
    const message = msg.text
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (existingUser && existingUser.subscribed) {
        await this.sendMessage(msg,
          'You are already subscribed for daily weather updates.',
        );
      } else {
        const regex = /^\/subscribe\s(.+)$/;
        const match = message.match(regex);
        if(match){
          const location = message.split(' ')[1];
        // If the user is not subscribed, create a new user and save to MongoDB
        if (existingUser && !existingUser.subscribed) {
          await this.userModel.findOneAndUpdate(
            { telegram_id: telegramId },
            {
              subscribed: true,
              location:location
            },
          );
        } else {
          const newUser = new this.userModel({
            name: msg.from.first_name.concat(' ').concat(msg.from.last_name),
            telegram_id: telegramId,
            subscribed: true,
            location: location,
          });

          await newUser.save();
        }
        await this.sendMessage(msg,
          `Welcome! You have been subscribed for daily weather updates. Your location has been set to ${location}`,
        );
        }else{
          this.sendMessage(msg,'Please provide a location to subscribe.');
          return;
        }
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await this.sendMessage(msg,
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }
  
  async getUpdate(msg: any) {
    const telegramId = msg.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (existingUser && existingUser.subscribed) {
        const weatherUpdate =
          await this.weatherUpdateService.getWeatherUpdate(existingUser.location);
        await this.sendMessage(msg,weatherUpdate);
      } else {
        await this.sendMessage(msg,'You are not subscribed for daily weather updates.');
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await this.sendMessage(msg,
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  // Every day at 6 am and 6 pm
  @Cron('0 6,18 * * *')
  async sendPeriodicUpdates() {
    const subscribedUsers = await this.userModel.find({ subscribed: true });
    subscribedUsers.forEach(async (user) => {
      const weatherUpdate = await this.weatherUpdateService.getWeatherUpdate(user.location);
    //   this.bot.telegram.sendMessage(user.telegram_id,weatherUpdate)
    });
  }
}
