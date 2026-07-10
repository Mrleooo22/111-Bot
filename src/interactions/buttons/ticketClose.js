import {
    PermissionFlagsBits
} from 'discord.js';

import {
    closeTicket,
    addTicketCloseCount
} from '../../services/ticketService.js';

import {
    createTranscript
} from '../../services/transcriptService.js';


const TICKET_ROLE_ID = '1441085746839556167';


export default {
    name: 'ticket_close',

    async execute(interaction) {

        const hasStaffRole = interaction.member.roles.cache.has(
            TICKET_ROLE_ID
        );

        if (!hasStaffRole && !interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
        )) {
            return interaction.reply({
                content: '❌ You do not have permission to close tickets.',
                ephemeral: true
            });
        }


        await interaction.reply({
            content: '🔒 Closing ticket and creating transcript...',
            ephemeral: true
        });


        await createTranscript(
            interaction.client,
            interaction.channel,
            interaction.user.id
        );


        await closeTicket(
            interaction.client,
            interaction.guild.id,
            interaction.channel.id,
            interaction.user.id
        );


        await addTicketCloseCount(
            interaction.client,
            interaction.guild.id,
            interaction.user.id
        );


        setTimeout(async () => {

            await interaction.channel.delete()
                .catch(() => {});

        }, 3000);
    }
};
