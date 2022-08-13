require('dotenv').config();

const cron = require('node-cron');

const {
   Client,
   GatewayIntentBits,
} = require('discord.js');

const DiscordClient = new Client({
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
   ],
   partials: [
      'MESSAGE',
      'CHANNEL',
      'REACTION',
   ],
});

const MESSAGE_REACTIONS = {
   ADD_EMOJI: 'messageReactionAdd',
   REMOVE_EMOJI: 'messageReactionRemove',
};

const EMOJI_MAP = {
   KEYS: ['🍷', '🍑', '🥕', '🍌', '🍦', '🥑', '🫐', '🍇', '🍆'],
   '🍷': {
      id: '1003406020858621984',
      name: 'wine_glass',
      role: {
         id: process.env.ROLE_RED_ID,
         name: 'red',
      },
   },
   '🍑': {
      id: '1004013630766993488',
      name: 'peach',
      role: {
         id: process.env.ROLE_PINK_ID,
         name: 'pink',
      },
   },
   '🥕': {
      id: '1003406020858621984',
      name: 'carrot',
      role: {
         id: process.env.ROLE_ORANGE_ID,
         name: 'orange',
      }
   },
   '🍌': {
      id: '1003406020858621984',
      name: 'banana',
      role: {
         id: process.env.ROLE_YELLOW_ID,
         name: 'yellow',
      }
   },
   '🍦': {
      id: '1004020337471664228',
      name: 'icecream',
      role: {
         id: process.env.ROLE_CREAM_ID,
         name: 'cream',
      }
   },
   '🥑': {
      id: '1003406020858621984',
      name: 'avocado',
      role: {
         id: process.env.ROLE_GREEN_ID,
         name: 'green',
      }
   },
   '🫐': {
      id: '1003343909767893142',
      name: 'blueberries',
      role: {
         id: process.env.ROLE_BLUE_ID,
         name: 'blue',
      }
   },
   '🍇': {
      id: '1003407149197709424',
      name: 'grapes',
      role: {
         id: process.env.ROLE_INDIGO_ID,
         name: 'indigo',
      },
   },
   '🍆': {
      id: '1003406020858621984',
      name: 'eggplant',
      role: {
         id: process.env.ROLE_PURPLE_ID,
         name: 'purple',
      },
   },
};

//const USERS = [
//   {
//      id: '',
//      name: '',
//      tag: '',
//      birthday: {
//         month: '',
//         day: '',
//      },
//      emoji: {
//         text: '',
//      }
//   },
//];

const onMessageReaction = async (reaction, user, type) => {
   const { name } = reaction.emoji;
   if (reaction.message.id !== process.env.CHANNEL_ROLES_MESSAGE_COLOR_ID || !user.id) return;

   const member = reaction.message.guild.members.cache.get(user.id);
   const SpamChannel = DiscordClient.channels.cache.get(process.env.CHANNEL_SPAM_ID);

   if (type === MESSAGE_REACTIONS.ADD_EMOJI) {
      try {
         member.roles.add(EMOJI_MAP[name].role.id);
         SpamChannel.send(`YIPPEE ${user} u r da color ${EMOJI_MAP[name].role.name} meow!!!`);
         EMOJI_MAP.KEYS.forEach(async (emoji) => {
            if (name !== emoji) {
               reaction.message.guild.members.cache.get(user.id).roles.remove(EMOJI_MAP[emoji].role.id);
               const message = await DiscordClient.channels.cache.get(process.env.CHANNEL_ROLES_ID).messages.fetch(process.env.CHANNEL_ROLES_MESSAGE_COLOR_ID)
               message.reactions.resolve(emoji)?.users.remove(user.id);
            }
         });
      } catch (error) { }
   }

   if (type === MESSAGE_REACTIONS.REMOVE_EMOJI) {
      try {
         member.roles.remove(EMOJI_MAP[name].role.id);
      } catch (error) { }
   }
};

//const scheduleBirthdayWishes = () => {
//   // Fetch the general channel that you'll send the birthday message
//   const MainChannel = DiscordClient.channels.cache.get(process.env.CHANNEL_MAIN_ID);
//   
//   // For every birthday
//   BIRTHDAYS.forEach((user) => {
//      // Define the user object of the user Id
//      const DiscordUser= DiscordClient.users.cache.get(user.id);
//      
//      // Create a cron schedule
//      cron.schedule(`* * ${user.birthday.day} ${user.birthday.month} *`, () => {
//         MainChannel.send(`Hey ${DiscordUser} AKA ${user.name}!!! HAPPY BIRTHDAY!!!!!!! ${user.emoji.text}`);
//      });
//   });   
//};

// When the client is ready, run this code (only once)
DiscordClient.once('ready', () => {
   console.log(`${DiscordClient.user.tag} has logged in!`);
   DiscordClient.channels.cache
      .get(process.env.CHANNEL_ROLES_ID).messages
      .fetch(process.env.CHANNEL_ROLES_MESSAGE_COLOR_ID).then(() => {
         DiscordClient.on('messageReactionAdd', (reaction, user) => onMessageReaction(reaction, user, MESSAGE_REACTIONS.ADD_EMOJI));
         DiscordClient.on('messageReactionRemove', (reaction, user) => onMessageReaction(reaction, user, MESSAGE_REACTIONS.REMOVE_EMOJI));
      });
   //DiscordClient.on('ready', scheduleBirthdayWishes);
});

DiscordClient.login(process.env.DISCORD_BOT_TOKEN);