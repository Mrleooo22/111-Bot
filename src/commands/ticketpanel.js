import { 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} from 'discord.js';

export default {
    data: {
        name: 'ticketpanel',
        description: 'Create the ticket panel'
    },

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ You need Administrator permission to use this.',
                ephemeral: true
            });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_dropdown')
            .setPlaceholder('Select a ticket type')
            .addOptions([
                {
                    label: 'Purchase',
                    description: 'Open a purchase ticket',
                    value: 'purchase',
                    emoji: '🛒'
                },
                {
                    label: 'General Support',
                    description: 'Open a general support ticket',
                    value: 'support',
                    emoji: '🛠️'
                },
                {
                    label: 'Leaker Application',
                    description: 'Apply for leaker access',
                    value: 'leaker',
                    emoji: '📝'
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(menu);


        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Support')
            .setDescription(
                'Select a category below to create a ticket.\n\n' +
                '🛒 Purchase\n' +
                '🛠️ General Support\n' +
                '📝 Leaker Application'
            )
            .setColor('#5865F2');


        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
