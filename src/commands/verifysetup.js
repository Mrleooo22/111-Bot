import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} from 'discord.js';

const VERIFY_ROLE_ID = '1441085746839556167';

export default {
    data: new SlashCommandBuilder()
        .setName('verifysetup')
        .setDescription('Create the verification panel'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('✅ Verification')
            .setDescription('Click the button below to verify yourself and gain access to the server.')
            .setColor('Green');

        const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('Verify')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder()
            .addComponents(verifyButton);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
