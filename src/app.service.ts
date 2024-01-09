import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
const { message } = require('telegraf/filters');
import { User } from './schemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { WeatherService } from './weather/weather.service';

@Update()
@Injectable()
export class AppService {
  bot = new Telegraf('6559691270:AAEN2AwtYSIIkWa0_l6iYAy-r8XhqWkS3Dg');
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly weatherUpdateService: WeatherService,
  ) {
    this.startBot();
  }

  getData(): { message: string } {
    return { message: 'Welcome to server!' };
  }

  startBot() {
    this.bot.start((ctx) => ctx.reply('Welcome'));

    this.bot.help((ctx) => ctx.reply('Send me a sticker'));

    this.bot.on(message('sticker'), (ctx) => ctx.reply('👍'));

    this.bot.hears('hi', (ctx) => ctx.reply('Hey there! I am a weather bot!'));

    this.bot.command('unsubscribe', (ctx) => this.unsubscribeUser(ctx));
    this.bot.command('subscribe', (ctx) => this.subscribeUser(ctx));
    this.bot.command('getweatherupdate', (ctx) => this.getUpdate(ctx));
    this.bot.command('updatelocation', (ctx) => this.updateLocation(ctx));
    this.bot.launch()
  }
  async unsubscribeUser(ctx: Context) {
    const telegramId = ctx.from.id;
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
        await ctx.reply(
          'Bye bye! You have been un-subscribed for daily weather updates.',
        );
      } else {
        await ctx.reply('You are not subscribed for daily weather updates.');
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  async updateLocation(ctx:any){
    const telegramId = ctx.from.id;
    try {
      // Check if the user is present and subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (!existingUser || !existingUser.subscribed) {
        await ctx.reply('You are not subscribed for daily weather updates.');
      }else{
        const regex = /^\/updatelocation\s(.+)$/;
        const match = ctx.message.text.match(regex);
        if(match){
          const location = match[1];
          await this.userModel.findOneAndUpdate(
            { telegram_id: telegramId },
            {
              location:location
            },
          );
          await ctx.reply(
            `You will now receive location updates from ${location}`,
          );
          return
        }else{
          ctx.reply('Please provide a location to subscribe.');
          return;
        }
      }
    }catch(error){
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  async subscribeUser(ctx:any) {
    const telegramId = ctx.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (existingUser && existingUser.subscribed) {
        await ctx.reply(
          'You are already subscribed for daily weather updates.',
        );
      } else {
        const regex = /^\/subscribe\s(.+)$/;
        const match = ctx.message.text.match(regex);
        if(match){
          const location = ctx.message.text.split(' ')[1];
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
            name: ctx.from.first_name.concat(' ').concat(ctx.from.last_name),
            telegram_id: telegramId,
            subscribed: true,
            location: location,
          });

          await newUser.save();
        }
        await ctx.reply(
          `Welcome! You have been subscribed for daily weather updates. Your location has been set to ${location}`,
        );
        }else{
          ctx.reply('Please provide a location to subscribe.');
          return;
        }
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  async getUpdate(ctx: Context) {
    const telegramId = ctx.from.id;
    try {
      // Check if the user is already subscribed
      const existingUser = await this.userModel.findOne({
        telegram_id: telegramId,
      });
      if (existingUser && existingUser.subscribed) {
        const weatherUpdate =
          await this.weatherUpdateService.getWeatherUpdate(existingUser.location);
        await ctx.reply(weatherUpdate);
      } else {
        await ctx.reply('You are not subscribed for daily weather updates.');
      }
    } catch (error) {
      console.error('Error subscribing user:', error);
      await ctx.reply(
        'An error occurred while processing your request. Please try again later.',
      );
    }
  }

  //Every day at 6 am and 6 pm
  @Cron('0 6,18 * * *')
  async sendPeriodicUpdates() {
    const subscribedUsers = await this.userModel.find({ subscribed: true });
    subscribedUsers.forEach(async (user) => {
      const weatherUpdate = await this.weatherUpdateService.getWeatherUpdate(user.location);
      this.bot.telegram.sendMessage(user.telegram_id,weatherUpdate)
    });
  }
}
