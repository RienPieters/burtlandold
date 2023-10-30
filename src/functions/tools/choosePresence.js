const { ActivityType } = require("discord.js");

module.exports = (client) => {
    client.choosePresence = async () => {
        const options = [
            {
                type: ActivityType.Watching,
                text: 'the clan expand',
                status: 'idle',
            },
            {
                type: ActivityType.Playing,
                text: 'ROSE Online',
                status: 'online',
            },
            {
                type: ActivityType.Listening,
                text: 'your commands',
                status: 'dnd',
            },
        ];

        const option = options[Math.floor(Math.random() * options.length)];

        client.user.setPresence({
            activities: [{
                name: option.text, // Use option.text, not options[option].text
                type: option.type,
            }],
            status: option.status,
        });
    };
};
