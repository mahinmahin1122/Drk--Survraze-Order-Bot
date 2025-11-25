const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = './';

client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}!`);
    console.log('🚀 Bot is now running on Railway.app!');
    console.log('📝 Usage: ./approved username');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'approved') {
        const username = args[0];

        if (!username) {
            return message.reply('❌ Usage: `./approved username`');
        }

        try {
            console.log(`🔍 Searching for user: ${username}`);
            
            // Find user by username
            const user = client.users.cache.find(u => 
                u.username.toLowerCase() === username.toLowerCase()
            );
            
            if (!user) {
                console.log(`❌ User not found: ${username}`);
                return message.reply(`❌ User "${username}" not found!`);
            }

            console.log(`✅ User found: ${user.tag}`);

            // Send DM
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
                
                console.log(`📨 Message sent to: ${user.tag}`);
                await message.reply(`✅ Approval message sent to **${user.tag}**`);
                
            } catch (dmError) {
                console.log(`❌ DM failed for: ${user.tag}`);
                await message.reply(`❌ Could not send DM to **${user.tag}**. DMs might be disabled.`);
            }

        } catch (error) {
            console.error('Error:', error);
            await message.reply('❌ An error occurred.');
        }
    }
});

// Error handling
client.on('error', console.error);

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

// Login
client.login(TOKEN).catch(error => {
    console.error('❌ Failed to login:', error);
    process.exit(1);
});
