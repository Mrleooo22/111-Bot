import { logger } from '../utils/logger.js';

const TRANSCRIPT_CHANNEL_ID = '1495042649227268136';

export async function createTranscript(client, channel, closedBy) {
    try {
        const messages = await channel.messages.fetch({ limit: 100 });

        const sortedMessages = [...messages.values()]
            .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let transcript = '';

        transcript += `Ticket Transcript\n`;
        transcript += `Server: ${channel.guild.name}\n`;
        transcript += `Channel: ${channel.name}\n`;
        transcript += `Closed By: ${closedBy}\n`;
        transcript += `Date: ${new Date().toISOString()}\n`;
        transcript += `\n-------------------------\n\n`;

        for (const message of sortedMessages) {
            transcript += `[${message.createdAt.toISOString()}] ${message.author.tag}: ${message.content}\n`;
        }

        const transcriptChannel = channel.guild.channels.cache.get(
            TRANSCRIPT_CHANNEL_ID
        );

        if (!transcriptChannel) {
            logger.warn('Transcript channel not found');
            return false;
        }

        await transcriptChannel.send({
            content: `📄 Transcript created for **${channel.name}**\nClosed by: <@${closedBy}>`,
            files: [
                {
                    attachment: Buffer.from(transcript, 'utf-8'),
                    name: `${channel.name}-transcript.txt`
                }
            ]
        });

        return true;

    } catch (error) {
        logger.error('Error creating transcript:', error);
        return false;
    }
}
