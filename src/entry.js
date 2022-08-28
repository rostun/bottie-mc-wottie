require('dotenv').config();

const cron = require('node-cron');

const {
   Client,
   GatewayIntentBits,
} = require('discord.js');

const USERS = require('./users.json');
const EMOJIS = require('./emojis');
const TEXT_FACES = require('./text-faces');

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

const onMessageReaction = async (reaction, user, type) => {
   const { name } = reaction.emoji;
   if (reaction.message.id !== process.env.CHANNEL_ROLES_MESSAGE_COLOR_ID || !user.id) return;

   const member = reaction.message.guild.members.cache.get(user.id);
   const SpamChannel = DiscordClient.channels.cache.get(process.env.CHANNEL_SPAM_ID);

   if (type === MESSAGE_REACTIONS.ADD_EMOJI) {
      try {
         member.roles.add(EMOJIS[name].role.id);
         SpamChannel.send(`Roses are red, violets are blue, and apparently ${user} is ${EMOJIS[name].role.name} now!`);
         EMOJIS.KEYS.forEach(async (emoji) => {
            if (name !== emoji) {
               reaction.message.guild.members.cache.get(user.id).roles.remove(EMOJIS[emoji].role.id);
               const message = await DiscordClient.channels.cache.get(process.env.CHANNEL_ROLES_ID).messages.fetch(process.env.CHANNEL_ROLES_MESSAGE_COLOR_ID)
               message.reactions.resolve(emoji)?.users.remove(user.id);
            }
         });
      } catch (error) { }
   }

   if (type === MESSAGE_REACTIONS.REMOVE_EMOJI) {
      try {
         member.roles.remove(EMOJIS[name].role.id);
      } catch (error) { }
   }
};

const scheduleBirthdayWishes = () => {
   const MainChannel = DiscordClient.channels.cache.get(process.env.CHANNEL_MAIN_ID);
   
   USERS[process.env.CHANNEL_KEY].forEach((user) => {
      cron.schedule(
         `0 0 ${user.birthday.day} ${user.birthday.month} *`, 
         () => {
            const DiscordUser= user.id ? DiscordClient.users.cache.get(user.id) : user.name;
            const RandomTextFace = TEXT_FACES[Math.floor(Math.random() * TEXT_FACES.length)]

            MainChannel.send(`Good Morning and Happy Birthday ${DiscordUser}!`);
            MainChannel.send(`For this happy little birthday here's a happy little "${RandomTextFace.name}" emoji: `);
            MainChannel.send(`\n${RandomTextFace.text}`);
         }, 
         {
            scheduled: true,
            timezone: user.timezone || 'America/New_York',
         },
      );
   });   
};

// When the client is ready, run this code (only once)
DiscordClient.once('ready', () => {
   console.log(`${DiscordClient.user.tag} has logged in!`);
   DiscordClient.channels.cache
      .get(process.env.CHANNEL_ROLES_ID).messages
      .fetch(process.env.CHANNEL_ROLES_MESSAGE_COLOR_ID).then(() => {
         DiscordClient.on('messageReactionAdd', (reaction, user) => onMessageReaction(reaction, user, MESSAGE_REACTIONS.ADD_EMOJI));
         DiscordClient.on('messageReactionRemove', (reaction, user) => onMessageReaction(reaction, user, MESSAGE_REACTIONS.REMOVE_EMOJI));
      });
   scheduleBirthdayWishes();
});

DiscordClient.login(process.env.DISCORD_BOT_TOKEN);