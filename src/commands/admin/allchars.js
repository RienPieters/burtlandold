const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('allchars')
    .setDescription('Retrieve and display all characters in the clan'),

  async execute(interaction) {
    try {
      const member = await interaction.guild.members.fetch(interaction.user.id);

      if (!member.roles.cache.some(role => role.name === 'Inviter')) {
        return interaction.reply('You do not have permission to use this command.');
      }

      const userId = interaction.user.id;

      const usersRef = db.collection('users');
      const usersQuery = await usersRef.get();

      if (usersQuery.empty) {
        return interaction.reply('No character information found for any user.');
      }

      const allCharacterInfo = [];

      for (const userDoc of usersQuery.docs) {
        const userData = userDoc.data();
        const characters = userData.characters || [];

        if (characters.length === 0) {
          continue;
        }

        const groupedCharacters = {};

        characters.forEach((character) => {
          if (!groupedCharacters[character.class]) {
            groupedCharacters[character.class] = [];
          }
          groupedCharacters[character.class].push(character.ign);
        });

        const username = userDoc.id;

        allCharacterInfo.push({ user: username, characters: groupedCharacters });
      }

      if (allCharacterInfo.length === 0) {
        return interaction.reply('No character information found for any user.');
      }

      const allCharacterInfoWithUsernames = [];

      for (const userData of allCharacterInfo) {
        const userCharacters = [];
        const sortedClasses = Object.keys(userData.characters).sort();

        for (const characterClass of sortedClasses) {
          const characterNames = userData.characters[characterClass].map(userID => {
            const member = interaction.guild.members.cache.get(userID);
            return member ? member.displayName : userID;
          });
          userCharacters.push(`**${characterClass}**: ${characterNames.join(', ')}`);
        }

        const member = interaction.guild.members.cache.get(userData.user);
        const username = member ? member.displayName : userData.user;
        allCharacterInfoWithUsernames.push({
          user: username,
          characters: userCharacters,
        });
      }

      allCharacterInfoWithUsernames.sort((a, b) => a.user.localeCompare(b.user));

      const charactersPerPage = 5;
      let currentPage = 0;
      let characterInfoMessage = '';

      const sendPage = async (page) => {
        currentPage = page;
        const start = page * charactersPerPage;
        const end = (page + 1) * charactersPerPage;

        characterInfoMessage = allCharacterInfoWithUsernames
          .slice(start, end)
          .map((userData) => {
            return `**For ${userData.user}**:\n${userData.characters.join('\n')}`;
          }).join('\n\n');

        const embed = {
          title: `Character Information (Page ${page + 1}/${Math.ceil(allCharacterInfoWithUsernames.length / charactersPerPage)})`,
          description: characterInfoMessage,
          color: 0x00ff00,
        };

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('previous')
              .setLabel('Previous')
              .setStyle('Secondary')
              .setDisabled(page === 0 || userId !== interaction.user.id),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Next')
              .setStyle('Secondary')
              .setDisabled(page === Math.ceil(allCharacterInfoWithUsernames.length / charactersPerPage) - 1 || userId !== interaction.user.id),
          );

        if (!interaction.replied) {
          interaction.reply({ embeds: [embed], components: [row] });
        } else {
          interaction.editReply({ embeds: [embed], components: [row] });
        }
      };

      const filter = (i) => i.customId === 'previous' || i.customId === 'next';
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId === 'previous') {
          if (currentPage > 0) {
            if (userId === buttonInteraction.user.id) {
              if (!buttonInteraction.deferred) {
                await buttonInteraction.deferUpdate();
                sendPage(currentPage - 1);
              }
            }
          }
        } else if (buttonInteraction.customId === 'next') {
          if (currentPage < Math.ceil(allCharacterInfoWithUsernames.length / charactersPerPage) - 1) {
            if (userId === buttonInteraction.user.id) {
              if (!buttonInteraction.deferred) {
                await buttonInteraction.deferUpdate();
                sendPage(currentPage + 1);
              }
            }
          }
        }
      });

      collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
          const embed = {
            title: `Character Information (Page ${currentPage + 1}/${Math.ceil(allCharacterInfoWithUsernames.length / charactersPerPage)})`,
            description: characterInfoMessage,
            color: 0x00ff00,
          };

          await interaction.editReply({ embeds: [embed], components: [] });
        }
      });

      sendPage(0);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
