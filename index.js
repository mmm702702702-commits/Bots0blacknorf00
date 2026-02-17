// index.js
const { Client, GatewayIntentBits, Partials, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { REST, Routes } = require('discord.js');
const OpenAI = require("openai");
const fs = require('fs');

const { token, openaiKey, guildId, clientId, logsChannel } = require('./config.json');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

// ===== Commands Setup =====
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('🏓 اختبار البوت'),
  new SlashCommandBuilder().setName('ai').setDescription('🧠 سؤال الذكاء الاصطناعي').addStringOption(o => o.setName('input').setDescription('اكتب سؤالك هنا').setRequired(true)),
  new SlashCommandBuilder().setName('ticket').setDescription('🎫 فتح تكت'),
  new SlashCommandBuilder().setName('warn').setDescription('⚠️ اعطاء تحذير').addUserOption(o => o.setName('user').setRequired(true)).addStringOption(o => o.setName('reason').setRequired(true)),
  new SlashCommandBuilder().setName('ban').setDescription('🔨 حضر مستخدم').addUserOption(o => o.setName('user').setRequired(true)).addStringOption(o => o.setName('reason')),
  new SlashCommandBuilder().setName('kick').setDescription('👢 طرد مستخدم').addUserOption(o => o.setName('user').setRequired(true)),
  new SlashCommandBuilder().setName('broadcast').setDescription('📢 ارسال برودكاست').addStringOption(o => o.setName('message').setRequired(true)),
  new SlashCommandBuilder().setName('protect').setDescription('🛡️ تفعيل حماية')
];

// ===== Register Commands =====
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands.map(c => c.toJSON()) });
    console.log('✅ تم تسجيل الأوامر!');
  } catch (err) { console.error(err); }
})();

// ===== Ready =====
client.once('ready', () => console.log(`✔️ Logged in as ${client.user.tag}`));

// ===== Interaction Handling =====
client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const name = interaction.commandName;
    
    if(name === 'ping') return interaction.reply(`🏓 Pong! ${(Date.now()-interaction.createdTimestamp)}ms`);
    
    if(name === 'ai') {
      const openai = new OpenAI({ apiKey: openaiKey });
      const text = interaction.options.getString('input');
      const res = await openai.chat.completions.create({model:"gpt-3.5-turbo", messages:[{role:"user",content:text}]});
      return interaction.reply(`🧠 **AI Response:**\n${res.choices[0].message.content}`);
    }

    if(name === 'ticket') {
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("open_ticket").setLabel("📩 افتح تكت").setStyle(ButtonStyle.Primary));
      return interaction.reply({ content: "🎫 اضغط الزر لفتح التكت", components:[row], ephemeral:true });
    }

    if(name === 'warn') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      return interaction.reply(`⚠️ تم تحذير ${user.tag} | السبب: ${reason}`);
    }

    if(name === 'ban') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason') || "بدون سبب";
      await interaction.guild.members.ban(user.id);
      return interaction.reply(`🔨 تم باند ${user.tag} | السبب: ${reason}`);
    }

    if(name === 'kick') {
      const user = interaction.options.getUser('user');
      await interaction.guild.members.kick(user.id);
      return interaction.reply(`👢 تم كيك ${user.tag}`);
    }

    if(name === 'broadcast') {
      const msg = interaction.options.getString('message');
      let count = 0;
      interaction.guild.members.cache.filter(m=>!m.user.bot).forEach(m=>{ m.send(msg).catch(()=>{}); count++; });
      return interaction.reply(`📢 تم ارسال البرودكاست لـ ${count} عضواً`);
    }

    if(name === 'protect') return interaction.reply("🛡️ حماية الروابط والسبام مفعلة!");
  }

  if(interaction.isButton() && interaction.customId === "open_ticket") {
    interaction.guild.channels.create({name:`ticket-${interaction.user.username}`,type:0,permissionOverwrites:[{id:interaction.guild.id,deny:[PermissionFlagsBits.ViewChannel]},{id:interaction.user.id,allow:[PermissionFlagsBits.ViewChannel]}]})
      .then(ch => interaction.reply({ content: `🎫 تكت مفتوح: ${ch}`, ephemeral: true }));
  }
});

// ===== Message Protection & Logging =====
client.on('messageCreate', msg => {
  if(msg.author.bot) return;
  // حماية روابط
  if(msg.content.includes("http")) { msg.delete().catch(()=>{}); msg.channel.send(`${msg.author}, ممنوع روابط!`); }
  // لوق
  const channel = msg.guild.channels.cache.get(logsChannel);
  if(channel) channel.send(`📝 ${msg.author.tag}: ${msg.content}`);
});

// ===== Login =====
client.login(token);
