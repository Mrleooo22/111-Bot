import {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder
} from 'discord.js';

import { createTicket } from '../../services/ticketService.js';


const TICKET_ROLE_ID = '1441085746839556167';


export default {
    name: 'ticket_dropdown',

    async execute(interaction) {

        const choice = interaction.values[0];

        const existingChannel = interaction.guild.channels.cache.find(
            channel => channel.topic === `Ticket Owner: ${interaction.user.id}`
        );

        if (existingChannel) {
            return interaction.reply({
                content: `❌ You already have a ticket open: ${existingChannel}`,
                ephemeral: true
            });
        }


        const names = {
            purchase: 'purchase',
            support: 'support',
            leaker: 'leaker-application'
        };


        const ticketChannel = await interaction.guild.channels.create({
            name: `ticket-${names[choice]}`,
            type: ChannelType.GuildText,

            topic: `Ticket Owner: ${interaction.user.id}`,

            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: TICKET_ROLE_ID,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });


        await createTicket(interaction.client, {
            guildId: interaction.guild.id,
            channelId: ticketChannel.id,
            userId: interaction.user.id,
            type: choice
        });


        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Created')
            .setDescription(
                `Welcome ${interaction.user}!\n\n` +
                `Category: **${choice}**\n\n` +
                'A staff member will assist you soon.'
            )
            .setColor('#5865F2');


        await ticketChannel.send({
            content: `<@&${TICKET_ROLE_ID}> ${interaction.user}`,
            embeds: [embed]
        });


        await interaction.reply({
            content: `✅ Your ticket has been created: ${ticketChannel}`,
            ephemeral: true
        });
    }
};
