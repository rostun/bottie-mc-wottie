require('dotenv').config();

const {
   Client,
   WebhookClient,
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

const DiscordWebhookClient = new WebhookClient({
   id: process.env.WEBHOOK_ID,
   token: process.env.WEBHOOK_TOKEN,
});

const MESSAGE_REACTIONS = {
   ADD_EMOJI: 'messageReactionAdd',
   REMOVE_EMOJI: 'messageReactionRemove',
};

const EMOJI_MAP = {
   KEYS: ['🍎', '🍇', '🫐'],
   '🍎': {
      id: '1003343909767893142',
      name: 'apple',
      role: {
         id: '1003342184445120543',
         name: 'red',
      },
   },
   '🍇': {
      id: '1003343909767893142',
      name: 'grapes',
      role: {
         id: '1003342398098784336',
         name: 'purple',
      },
   },
   '🫐': {
      id: '1003343909767893142',
      name: 'blueberries',
      role: {
         id: '1003342448015200347',
         name: 'blue',
      }
   },
};

const onMessageReaction = async (reaction, user, type) => {
   const { name } = reaction.emoji;
   if (reaction.message.id !== process.env.SPAM_CHANNEL_ROLES_COLOR_ID || !user.id) return;

   const member = reaction.message.guild.members.cache.get(user.id);

   if (type === MESSAGE_REACTIONS.ADD_EMOJI) {
      try {
         member.roles.add(EMOJI_MAP[name].role.id);
         DiscordWebhookClient.send(`Yippee ${user.username} u r da color ${EMOJI_MAP[name].role.name} meow`);
         EMOJI_MAP.KEYS.forEach(async (emoji) => {
            if (name !== emoji) {
               reaction.message.guild.members.cache.get(user.id).roles.remove(EMOJI_MAP[emoji].role.id);
               const message = await DiscordClient.channels.cache.get(process.env.SPAM_CHANNEL_ROLES_ID).messages.fetch(process.env.SPAM_CHANNEL_ROLES_COLOR_ID)
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
}

// When the client is ready, run this code (only once)
DiscordClient.once('ready', () => {
   console.log(`${DiscordClient.user.tag} has logged in!`);
   DiscordClient.channels.cache
      .get(process.env.SPAM_CHANNEL_ROLES_ID).messages
      .fetch(process.env.SPAM_CHANNEL_ROLES_COLOR_ID).then(() => {
         DiscordClient.on('messageReactionAdd', (reaction, user) => onMessageReaction(reaction, user, MESSAGE_REACTIONS.ADD_EMOJI));
         DiscordClient.on('messageReactionRemove', (reaction, user) => onMessageReaction(reaction, user, MESSAGE_REACTIONS.REMOVE_EMOJI));
      });
});

DiscordClient.login(process.env.DISCORD_BOT_TOKEN);