require('dotenv').config();

const {
   Client,
   GatewayIntentBits,
} = require('discord.js');

const DISCORD_CLIENT = new Client({ 
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

// When the client is ready, run this code (only once)
DISCORD_CLIENT.once('ready', () => {
	console.log(`${DISCORD_CLIENT.user.tag} has logged in!`);
   DISCORD_CLIENT.channels.cache
      .get(process.env.SPAM_CHANNEL_ROLES_ID).messages
      .fetch(process.env.SPAM_CHANNEL_ROLES_COLOR_ID).then(() => {
         DISCORD_CLIENT.on('messageReactionAdd', (reaction, user) => {
            console.log('reaction: ', reaction);
            console.log('user: ', user);
         });
      });
});

//_client.on('messageCreate', (message) => {
//   console.log('someone said: ', message.content);
//});



DISCORD_CLIENT.on('messageReactionRemove', (reaction, user) => {

});

DISCORD_CLIENT.login(process.env.DISCORD_BOT_TOKEN);