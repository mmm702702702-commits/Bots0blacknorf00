const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel]
});

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!") || message.author.bot) return;

    const args = message.content.slice(1).split(/ +/);
    const command = args.shift().toLowerCase();

    // 🎫 Ticket
    if (command === "ticket") {
        const channel = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: 0,
            permissionOverwrites: [
                { id: message.guild.id, deny: ["ViewChannel"] },
                { id: message.author.id, allow: ["ViewChannel", "SendMessages"] }
            ]
        });
        channel.send(`🎫 أهلاً ${message.author} تم فتح تذكرتك`);
    }

    // 🔨 Kick
    if (command === "kick") {
        if (!message.member.permissions.has("KickMembers")) return;
        const user = message.mentions.members.first();
        if (!user) return message.reply("منشن شخص");
        await user.kick();
        message.channel.send("تم الطرد ✅");
    }

    // 🔒 Ban
    if (command === "ban") {
        if (!message.member.permissions.has("BanMembers")) return;
        const user = message.mentions.members.first();
        if (!user) return message.reply("منشن شخص");
        await user.ban();
        message.channel.send("تم الباند ✅");
    }

    // 🎭 Give Role
    if (command === "giverole") {
        if (!message.member.permissions.has("ManageRoles")) return;
        const user = message.mentions.members.first();
        const roleName = args.slice(1).join(" ");
        const role = message.guild.roles.cache.find(r => r.name === roleName);
        if (!role || !user) return message.reply("تأكد من الاسم");
        await user.roles.add(role);
        message.channel.send("تم إعطاء الرتبة ✅");
    }

    // ❌ Remove Role
    if (command === "removerole") {
        if (!message.member.permissions.has("ManageRoles")) return;
        const user = message.mentions.members.first();
        const roleName = args.slice(1).join(" ");
        const role = message.guild.roles.cache.find(r => r.name === roleName);
        if (!role || !user) return message.reply("تأكد من الاسم");
        await user.roles.remove(role);
        message.channel.send("تم إزالة الرتبة ✅");
    }

    // 🎵 Play Music
    if (command === "play") {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply("ادخل روم صوتي");

        const url = args[0];
        if (!url) return message.reply("حط رابط يوتيوب");

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });

        const stream = ytdl(url, { filter: "audioonly" });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.play(resource);
        connection.subscribe(player);

        message.channel.send("🎶 شغلنا لك المقطع!");
    }

    // 🎉 Fun
    if (command === "ping") message.channel.send("🏓 Pong!");
    if (command === "hello") message.channel.send("👋 نورت السيرفر!");
    if (command === "server") message.channel.send(`اسم السيرفر: ${message.guild.name}`);
});

client.login(process.env.TOKEN);
