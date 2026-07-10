import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticketpanel')
        .setDescription('Send the ticket panel'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('🎫 Support Tickets')
            .setDescription(
                'Select a category below to open a ticket.'
            )
            .setColor('Blue');

        await interaction.reply({
            embeds: [embed]
        });
    }
};
