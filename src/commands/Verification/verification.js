async function handleSetup(interaction, guild, client) {
    const verificationChannel = interaction.options.getChannel("verification_channel");
    const verifiedRole = interaction.options.getRole("verified_role");
    const message = interaction.options.getString("message") || botConfig.verification.defaultMessage;
    const buttonText = interaction.options.getString("button_text") || botConfig.verification.defaultButtonText;
    const botMember = guild.members.me;

    if (!botMember) {
        throw createError(
            'Bot member not found in guild cache',
            ErrorTypes.CONFIGURATION,
            'I could not verify my permissions in this server. Please try again in a moment.',
            { guildId: guild.id }
        );
    }

    const requiredChannelPermissions = [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ];

    const missingChannelPerms = requiredChannelPermissions.filter(perm =>
        !verificationChannel.permissionsFor(botMember).has(perm)
    );

    if (missingChannelPerms.length > 0) {
        throw createError(
            `Missing channel permissions: ${missingChannelPerms.join(', ')}`,
            ErrorTypes.PERMISSION,
            'I need **View Channel**, **Send Messages**, and **Embed Links** in the verification channel.',
            { missingPermissions: missingChannelPerms, channel: verificationChannel.id }
        );
    }

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
        throw createError(
            "Missing ManageRoles permission",
            ErrorTypes.PERMISSION,
            "I need the 'Manage Roles' permission to give verified roles.",
            { missingPermission: "ManageRoles" }
        );
    }

    if (verifiedRole.id === guild.id || verifiedRole.managed) {
        throw createError(
            'Invalid verified role selected',
            ErrorTypes.VALIDATION,
            'Please choose a normal assignable role (not @everyone or an integration-managed role).',
            { roleId: verifiedRole.id, managed: verifiedRole.managed }
        );
    }

    const botRole = botMember.roles.highest;

    if (verifiedRole.position >= botRole.position) {
        throw createError(
            "Role hierarchy error",
            ErrorTypes.PERMISSION,
            "The verified role must be below my highest role in the server role hierarchy.",
            { rolePosition: verifiedRole.position, botRolePosition: botRole.position }
        );
    }

    const guildConfig = await getGuildConfig(client, guild.id);
    const welcomeConfig = await getWelcomeConfig(client, guild.id);

    const hasAutoVerifyEnabled = Boolean(guildConfig.verification?.autoVerify?.enabled);
    const hasAutoRoleConfigured =
        Boolean(guildConfig.autoRole) ||
        (Array.isArray(welcomeConfig.roleIds) && welcomeConfig.roleIds.length > 0);

    if (hasAutoVerifyEnabled || hasAutoRoleConfigured) {
        throw createError(
            'Verification setup blocked by conflicting onboarding system',
            ErrorTypes.CONFIGURATION,
            'You cannot enable the verification system while **AutoVerify** or **AutoRole** is configured. Disable those first.',
            {
                guildId: guild.id,
                hasAutoVerifyEnabled,
                hasAutoRoleConfigured,
                expected: true,
                suppressErrorLog: true
            }
        );
    }

    await InteractionHelper.safeDefer(interaction);

    const verifyEmbed = createEmbed({
        title: "💜 111 Leaks | Verification",
        description:
            "To gain access to **111 Leaks**, click the **Verify** button below.\n\n" +
            "This helps us prevent bots, raids, and spam from entering the server while keeping the community safe.\n\n" +
            "Click **Verify** to continue.",
        color: "#ff00ff"
    })
        .setThumbnail("https://YOUR-LOGO-URL.png")
        .setImage("https://YOUR-BANNER-URL.png")
        .setFooter({
            text: "111 Leaks • Secure Verification"
        })
        .setTimestamp();

    const verifyButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("verify_user")
            .setLabel(buttonText)
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅")
    );

    const verifyMessage = await verificationChannel.send({
        embeds: [verifyEmbed],
        components: [verifyButton]
    });

    guildConfig.verification = {
        enabled: true,
        channelId: verificationChannel.id,
        messageId: verifyMessage.id,
        roleId: verifiedRole.id,
        message: message,
        buttonText: buttonText
    };

    await setGuildConfig(client, guild.id, guildConfig);

    await InteractionHelper.safeEditReply(interaction, {
        embeds: [
            successEmbed(
                'Verification System Updated',
                [
                    `Channel: ${verificationChannel}`,
                    `Verified Role: ${verifiedRole}`,
                    `Button Text: ${buttonText}`
                ].join('\n')
            )
        ]
    });
}
