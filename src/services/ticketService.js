import { logger } from '../utils/logger.js';

const TICKET_PREFIX = 'tickets:';

export async function createTicket(client, data) {
    try {
        const key = `${TICKET_PREFIX}${data.guildId}:${data.channelId}`;

        await client.db.set(key, {
            guildId: data.guildId,
            channelId: data.channelId,
            userId: data.userId,
            type: data.type,
            createdAt: Date.now(),
            closed: false,
            closedBy: null
        });

        return true;
    } catch (error) {
        logger.error('Error creating ticket data:', error);
        return false;
    }
}


export async function getTicket(client, guildId, channelId) {
    try {
        const key = `${TICKET_PREFIX}${guildId}:${channelId}`;

        const ticket = await client.db.get(key, null);

        return ticket;
    } catch (error) {
        logger.error('Error getting ticket:', error);
        return null;
    }
}


export async function closeTicket(client, guildId, channelId, closedBy) {
    try {
        const key = `${TICKET_PREFIX}${guildId}:${channelId}`;

        const ticket = await client.db.get(key, null);

        if (!ticket) {
            return false;
        }

        await client.db.set(key, {
            ...ticket,
            closed: true,
            closedBy,
            closedAt: Date.now()
        });

        return true;
    } catch (error) {
        logger.error('Error closing ticket:', error);
        return false;
    }
}


export async function addTicketCloseCount(client, guildId, userId) {
    try {
        const key = `ticketLeaderboard:${guildId}:${userId}`;

        const current = await client.db.get(key, {
            closes: 0
        });

        await client.db.set(key, {
            closes: (current.closes || 0) + 1
        });

        return true;
    } catch (error) {
        logger.error('Error updating ticket leaderboard:', error);
        return false;
    }
}


export async function getTicketLeaderboard(client, guildId) {
    try {
        const prefix = `ticketLeaderboard:${guildId}:`;

        const keys = await client.db.list(prefix);

        const users = [];

        for (const key of keys) {
            const userId = key.replace(prefix, '');

            const data = await client.db.get(key, {
                closes: 0
            });

            users.push({
                userId,
                closes: data.closes || 0
            });
        }

        return users.sort((a, b) => b.closes - a.closes);

    } catch (error) {
        logger.error('Error getting ticket leaderboard:', error);
        return [];
    }
}
