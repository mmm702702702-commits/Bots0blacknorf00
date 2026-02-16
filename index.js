const { Client, GatewayIntentBits, Partials, ChannelType } = require("discord.js");
const { QuickDB } = require("quick.db");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const ytdl = require("ytdl-core");

const db = new QuickDB();

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

// ✅ عند تشغيل البوت
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// 📨 استقبال الرسائل وتنفيذ الأوامر
client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("!") || message.author.bot) return;

    const args = message.content.slice(1).split(/ +/);
    const command = args.shift().toLowerCase();

    // 🎫 Ticket
    if (command === "ticket") {
        const channel = await message.guild.channels.create({
            name: `ticket-${message.author.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: message.guild.id, deny: ["ViewChannel"] },
                { id: message.author.id, allow: ["ViewChannel", "SendMessages"] }
            ]
        });
        channel.send(`🎫 أهلاً ${message.author} تم فتح تذكرتك`);
    }

    // ⚠ Warn
    if (command === "warn") {
        const user = message.mentions.members.first();
        if (!user) return message.reply("منشن شخص");

        const reason = args.join(" ") || "بدون سبب";
        let warns = await db.get(`warn_${user.id}`) || [];
        warns.push({ reason });
        await db.set(`warn_${user.id}`, warns);

        message.channel.send(`⚠ تم تحذير ${user}`);
    }

    if (command === "warnings") {
        const user = message.mentions.members.first() || message.member;
        let warns = await db.get(`warn_${user.id}`) || [];
        message.channel.send(`عدد التحذيرات: ${warns.length}`);
    }

    if (command === "clearwarn") {
        const user = message.mentions.members.first();
        if (!user) return message.reply("منشن عضو لحذف تحذيراته");
        await db.delete(`warn_${user.id}`);
        message.channel.send("تم حذف التحذيرات");
    }

    // 🔨 Kick
    if (command === "kick") {
        const user = message.mentions.members.first();
        if (!user) return message.reply("منشن عضو للطرد");
        await user.kick();
        message.channel.send("تم الطرد");
    }

    // 🔒 Ban
    if (command === "ban") {
        const user = message.mentions.members.first();
        if (!user) return message.reply("منشن عضو للباند");
        await user.ban();
        message.channel.send("تم الباند");
    }

    // 🎭 Roles
    if (command === "giverole") {
        const user = message.mentions.members.first();
        const roleName = args.join(" ");
        const role = message.guild.roles.cache.find(r => r.name === roleName);
        if (!role || !user) return message.reply("تأكد من اسم الرتبة والعضو");
        await user.roles.add(role);
        message.channel.send("تم إعطاء الرتبة");
    }

    if (command === "removerole") {
        const user = message.mentions.members.first();
        const roleName = args.join(" ");
        const role = message.guild.roles.cache.find(r => r.name === roleName);
        if (!role || !user) return message.reply("تأكد من اسم الرتبة والعضو");
        await user.roles.remove(role);
        message.channel.send("تم إزالة الرتبة");
    }

    // 📝 Nickname
    if (command === "nick") {
        const user = message.mentions.members.first();
        const newName = args.join(" ");
        if (!user) return message.reply("منشن عضو لتغيير اسمه");
        await user.setNickname(newName);
        message.channel.send("تم تغيير الاسم");
    }

    // 🎵 Music
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

        message.channel.send("🎶 استمتع بالموسيقى!");
    }

    // 🎉 Fun Commands
    if (command === "ping") message.channel.send("🏓 Pong!");
    if (command === "hello") message.channel.send("👋 أهلاً !");
    if (command === "server") message.channel.send(`اسم السيرفر: ${message.guild.name}`);
});

// 🔑 تسجيل الدخول بالبـTOKEN
client.login(process.env.TOKEN);MTQ3Mjg2NjAyNDYzNzU5OTg0OQ.GgqEQz.8bylAjl9WNARH2fRXy248Zkjfp0Hz2FEfx2afc
