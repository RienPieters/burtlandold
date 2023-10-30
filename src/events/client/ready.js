module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        setInterval(client.choosePresence, 60 * 1000);
        console.log(`Logged in as ${client.user.tag}!`);
    },
}