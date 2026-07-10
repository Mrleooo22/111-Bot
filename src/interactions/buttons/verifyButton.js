import { PermissionFlagsBits } from 'discord.js';

const VERIFY_ROLE_ID = '1441085746839556167';

export default {
    name: 'verify',

    async execute(interaction) {

        const role = interaction.guild.roles.cache.get(VERIFY_ROLE_ID);

        if (!role) {
            return interaction.reply({
                content: '❌ Verification role not found.',
                ephemeral: true
            });
        }

        if (interaction.member.roles.cache.has(VERIFY_ROLE_ID)) {
            return interaction.reply({
                content: '✅ You are already verified.',
                ephemeral: true
            });
        }

        await interaction.member.roles.add(role);

        await interaction.reply({
            content: '✅ You have been verified!',
            ephemeral: true
        });
    }
};
