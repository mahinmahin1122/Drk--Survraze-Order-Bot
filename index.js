const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Environment variables from Replit
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Slash Command তৈরি করা
const commands = [
    new SlashCommandBuilder()
        .setName('approved')
        .setDescription('Send approval message to user')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Discord username (e.g., user#1234)')
                .setRequired(true)
        )
].map(command => command.toJSON());

// Slash Command রেজিস্টার করা
const rest = new REST({ version: '10' }).setToken(TOKEN);

async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

// বট রেডি হলে
client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}!`);
    console.log(`🏠 Invite link: https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&permissions=2048&scope=bot%20applications.commands`);
    registerCommands();
});

// ইন্টার্যাকশন হ্যান্ডলিং
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'approved') {
        const username = interaction.options.getString('username');

        try {
            // ইউজার খুঁজে বের করা
            const user = client.users.cache.find(u => u.tag === username);
            
            if (!user) {
                await interaction.reply({
                    content: `❌ User "${username}" not found!\nMake sure the username is correct (including discriminator like user#1234).`,
                    ephemeral: true
                });
                return;
            }

            // ইউজারকে DM পাঠানো
            try {
                await user.send({
                    embeds: [
                        {
                            title: "🎉 Order Approved! 🎉",
                            description: "Your order has been successfully approved!",
                            color: 0x00ff00,
                            fields: [
                                {
                                    name: "Status",
                                    value: "✅ Approved",
                                    inline: true
                                },
                                {
                                    name: "Next Steps",
                                    value: "Your order will be processed shortly.",
                                    inline: true
                                }
                            ],
                            timestamp: new Date(),
                            footer: {
                                text: "Thank you for your purchase!"
                            }
                        }
                    ]
                });
                
                await interaction.reply({
                    content: `✅ Successfully sent approval message to **${username}**`,
                    ephemeral: true
                });

                console.log(`📨 Approval message sent to: ${username}`);

            } catch (dmError) {
                await interaction.reply({
                    content: `❌ Could not send DM to ${username}. They might have DMs disabled or the bot is not in a shared server with them.`,
                    ephemeral: true
                });
            }

        } catch (error) {
            console.error('Error:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                ephemeral: true
            });
        }
    }
});

// Error handling
client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// বট লগইন
if (!TOKEN || !CLIENT_ID) {
    console.error('❌ ERROR: Please set DISCORD_TOKEN and CLIENT_ID in environment variables!');
    process.exit(1);
}

client.login(TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});
