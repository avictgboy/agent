import { pool, db } from './server/db';
import * as schema from './shared/schema';
import { readFileSync } from 'fs';
import { eq } from 'drizzle-orm';

async function importData() {
  try {
    console.log('Starting data import process...');
    
    // Read the backup files
    const backupContent = readFileSync('./backup.sql', 'utf-8');
    const backupContent2 = readFileSync('./betwinner_backup.sql', 'utf-8');
    console.log('Backup files loaded successfully.');
    
    // Extract data from the backup using regex
    
    // Extract users data
    const usersRegex = /COPY public\.users.*?FROM stdin;\n([\s\S]*?)\\./;
    const usersMatch = backupContent.match(usersRegex);
    const usersMatch2 = backupContent2.match(usersRegex);
    
    const usersToImport = [];
    
    if (usersMatch && usersMatch[1]) {
      const usersData = usersMatch[1].trim().split('\n');
      console.log(`Found ${usersData.length} users in first backup file`);
      
      for (const userData of usersData) {
        usersToImport.push(userData);
      }
    }
    
    if (usersMatch2 && usersMatch2[1]) {
      const usersData = usersMatch2[1].trim().split('\n');
      console.log(`Found ${usersData.length} users in second backup file`);
      
      for (const userData of usersData) {
        usersToImport.push(userData);
      }
    }
    
    console.log(`Total of ${usersToImport.length} users to import`);
    
    for (const userData of usersToImport) {
      const [id, username, password, fullName, email, phone, balance, agentId, promoCode, createdAt] = userData.split('\t');
      
      // Check if user already exists
      const existingUser = await db.select().from(schema.users).where(eq(schema.users.username, username));
      
      if (existingUser.length === 0) {
        // Insert user
        await db.insert(schema.users).values({
          username,
          password,
          fullName,
          email,
          phone,
          balance,
          agentId,
          promoCode,
          role: 'agent',
          createdAt: new Date(createdAt)
        });
        console.log(`Imported user: ${username}`);
      } else {
        console.log(`User ${username} already exists, skipping...`);
      }
    }
    
    if (usersToImport.length === 0) {
      console.log('No users data found in backup files.');
    }
    
    // Extract players data
    const playersRegex = /COPY public\.players.*?FROM stdin;\n([\s\S]*?)\\./;
    const playersMatch = backupContent.match(playersRegex);
    const playersMatch2 = backupContent2.match(playersRegex);
    
    const playersToImport = [];
    
    if (playersMatch && playersMatch[1]) {
      const playersData = playersMatch[1].trim().split('\n');
      console.log(`Found ${playersData.length} players in first backup file`);
      
      for (const playerData of playersData) {
        playersToImport.push(playerData);
      }
    }
    
    if (playersMatch2 && playersMatch2[1]) {
      const playersData = playersMatch2[1].trim().split('\n');
      console.log(`Found ${playersData.length} players in second backup file`);
      
      for (const playerData of playersData) {
        playersToImport.push(playerData);
      }
    }
    
    console.log(`Total of ${playersToImport.length} players to import`);
    
    for (const playerData of playersToImport) {
      const [id, username, agentId, registrationDate, firstDepositAmount, totalDeposits, totalWithdrawals, isActive] = playerData.split('\t');
      
      // Check if player already exists
      const existingPlayer = await db.select().from(schema.players).where(eq(schema.players.username, username));
      
      if (existingPlayer.length === 0) {
        // Insert player
        await db.insert(schema.players).values({
          username,
          agentId: parseInt(agentId),
          registrationDate: new Date(registrationDate),
          firstDepositAmount,
          totalDeposits,
          totalWithdrawals,
          isActive: isActive === 't'
        });
        console.log(`Imported player: ${username}`);
      } else {
        console.log(`Player ${username} already exists, skipping...`);
      }
    }
    
    if (playersToImport.length === 0) {
      console.log('No players data found in backup files.');
    }
    
    // Extract transactions data
    const transactionsRegex = /COPY public\.player_transactions.*?FROM stdin;\n([\s\S]*?)\\./;
    const transactionsMatch = backupContent.match(transactionsRegex);
    const transactionsMatch2 = backupContent2.match(transactionsRegex);
    
    const transactionsToImport = [];
    
    if (transactionsMatch && transactionsMatch[1]) {
      const transactionsData = transactionsMatch[1].trim().split('\n');
      console.log(`Found ${transactionsData.length} transactions in first backup file`);
      
      for (const transactionData of transactionsData) {
        transactionsToImport.push(transactionData);
      }
    }
    
    if (transactionsMatch2 && transactionsMatch2[1]) {
      const transactionsData = transactionsMatch2[1].trim().split('\n');
      console.log(`Found ${transactionsData.length} transactions in second backup file`);
      
      for (const transactionData of transactionsData) {
        transactionsToImport.push(transactionData);
      }
    }
    
    console.log(`Total of ${transactionsToImport.length} transactions to import`);
    
    for (const transactionData of transactionsToImport) {
      const [id, agentId, playerId, type, amount, paymentCode, status, commissionAmount, createdAt, updatedAt] = transactionData.split('\t');
      
      try {
        // Check if transaction already exists by checking the agent, player and creation time
        const existingTransaction = await db.select().from(schema.playerTransactions)
          .where(eq(schema.playerTransactions.agentId, parseInt(agentId)))
          .where(eq(schema.playerTransactions.playerId, playerId));
        
        const dateCreated = new Date(createdAt);
        const existingWithDate = existingTransaction.filter(tx => 
          tx.createdAt && tx.createdAt.getTime() === dateCreated.getTime()
        );
        
        if (existingWithDate.length === 0) {
          // Insert transaction
          await db.insert(schema.playerTransactions).values({
            agentId: parseInt(agentId),
            playerId,
            type,
            amount,
            paymentCode,
            status,
            commissionAmount,
            createdAt: dateCreated,
            updatedAt: new Date(updatedAt)
          });
          console.log(`Imported transaction for player: ${playerId}`);
        } else {
          console.log(`Transaction for player ${playerId} at ${createdAt} already exists, skipping...`);
        }
      } catch (error) {
        console.error(`Error importing transaction: ${error.message}`);
      }
    }
    
    if (transactionsToImport.length === 0) {
      console.log('No transactions data found in backup files.');
    }
    
    // Extract commissions data
    const commissionsRegex = /COPY public\.commissions.*?FROM stdin;\n([\s\S]*?)\\./;
    const commissionsMatch = backupContent.match(commissionsRegex);
    const commissionsMatch2 = backupContent2.match(commissionsRegex);
    
    const commissionsToImport = [];
    
    if (commissionsMatch && commissionsMatch[1]) {
      const commissionsData = commissionsMatch[1].trim().split('\n');
      console.log(`Found ${commissionsData.length} commissions in first backup file`);
      
      for (const commissionData of commissionsData) {
        commissionsToImport.push(commissionData);
      }
    }
    
    if (commissionsMatch2 && commissionsMatch2[1]) {
      const commissionsData = commissionsMatch2[1].trim().split('\n');
      console.log(`Found ${commissionsData.length} commissions in second backup file`);
      
      for (const commissionData of commissionsData) {
        commissionsToImport.push(commissionData);
      }
    }
    
    console.log(`Total of ${commissionsToImport.length} commissions to import`);
    
    for (const commissionData of commissionsToImport) {
      const [id, agentId, playerId, transactionId, type, amount, commission, isPaid, paidDate, createdAt] = commissionData.split('\t');
      
      try {
        // Check if commission already exists
        const existingCommission = await db.select().from(schema.commissions)
          .where(eq(schema.commissions.agentId, parseInt(agentId)))
          .where(eq(schema.commissions.playerId, playerId));
        
        const dateCreated = new Date(createdAt);
        const existingWithDate = existingCommission.filter(c => 
          c.createdAt && c.createdAt.getTime() === dateCreated.getTime()
        );
        
        if (existingWithDate.length === 0) {
          // Insert commission
          await db.insert(schema.commissions).values({
            agentId: parseInt(agentId),
            playerId,
            transactionId: transactionId ? parseInt(transactionId) : null,
            type,
            amount,
            commission,
            isPaid: isPaid === 't',
            paidDate: paidDate ? new Date(paidDate) : null,
            createdAt: dateCreated
          });
          console.log(`Imported commission for agent: ${agentId}`);
        } else {
          console.log(`Commission for agent ${agentId} at ${createdAt} already exists, skipping...`);
        }
      } catch (error) {
        console.error(`Error importing commission: ${error.message}`);
      }
    }
    
    if (commissionsToImport.length === 0) {
      console.log('No commissions data found in backup files.');
    }
    
    // Extract support tickets data
    const ticketsRegex = /COPY public\.support_tickets.*?FROM stdin;\n([\s\S]*?)\\./;
    const ticketsMatch = backupContent.match(ticketsRegex);
    const ticketsMatch2 = backupContent2.match(ticketsRegex);
    
    const ticketsToImport = [];
    
    if (ticketsMatch && ticketsMatch[1]) {
      const ticketsData = ticketsMatch[1].trim().split('\n');
      console.log(`Found ${ticketsData.length} support tickets in first backup file`);
      
      for (const ticketData of ticketsData) {
        ticketsToImport.push(ticketData);
      }
    }
    
    if (ticketsMatch2 && ticketsMatch2[1]) {
      const ticketsData = ticketsMatch2[1].trim().split('\n');
      console.log(`Found ${ticketsData.length} support tickets in second backup file`);
      
      for (const ticketData of ticketsData) {
        ticketsToImport.push(ticketData);
      }
    }
    
    console.log(`Total of ${ticketsToImport.length} support tickets to import`);
    
    for (const ticketData of ticketsToImport) {
      const [id, userId, subject, status, lastActivity, createdAt] = ticketData.split('\t');
      
      try {
        // Check if ticket already exists
        const existingTicket = await db.select().from(schema.supportTickets)
          .where(eq(schema.supportTickets.userId, parseInt(userId)));
        
        const dateCreated = new Date(createdAt);
        const existingWithDate = existingTicket.filter(t => 
          t.createdAt && t.createdAt.getTime() === dateCreated.getTime()
        );
        
        if (existingWithDate.length === 0) {
          // Insert ticket
          await db.insert(schema.supportTickets).values({
            userId: parseInt(userId),
            subject,
            status,
            lastActivity: new Date(lastActivity),
            createdAt: dateCreated
          });
          console.log(`Imported support ticket: ${id}`);
        } else {
          console.log(`Support ticket ${id} already exists, skipping...`);
        }
      } catch (error) {
        console.error(`Error importing support ticket: ${error.message}`);
      }
    }
    
    if (ticketsToImport.length === 0) {
      console.log('No support tickets data found in backup files.');
    }
    
    // Extract support messages data
    const messagesRegex = /COPY public\.support_messages.*?FROM stdin;\n([\s\S]*?)\\./;
    const messagesMatch = backupContent.match(messagesRegex);
    const messagesMatch2 = backupContent2.match(messagesRegex);
    
    const messagesToImport = [];
    
    if (messagesMatch && messagesMatch[1]) {
      const messagesData = messagesMatch[1].trim().split('\n');
      console.log(`Found ${messagesData.length} support messages in first backup file`);
      
      for (const messageData of messagesData) {
        messagesToImport.push(messageData);
      }
    }
    
    if (messagesMatch2 && messagesMatch2[1]) {
      const messagesData = messagesMatch2[1].trim().split('\n');
      console.log(`Found ${messagesData.length} support messages in second backup file`);
      
      for (const messageData of messagesData) {
        messagesToImport.push(messageData);
      }
    }
    
    console.log(`Total of ${messagesToImport.length} support messages to import`);
    
    for (const messageData of messagesToImport) {
      const [id, ticketId, sender, content, read, createdAt] = messageData.split('\t');
      
      try {
        // Check if message already exists
        const existingMessage = await db.select().from(schema.supportMessages)
          .where(eq(schema.supportMessages.ticketId, parseInt(ticketId)));
        
        const dateCreated = new Date(createdAt);
        const existingWithDate = existingMessage.filter(m => 
          m.createdAt && m.createdAt.getTime() === dateCreated.getTime()
        );
        
        if (existingWithDate.length === 0) {
          // Insert message
          await db.insert(schema.supportMessages).values({
            ticketId: parseInt(ticketId),
            sender,
            content,
            read: read === 't',
            createdAt: dateCreated
          });
          console.log(`Imported support message: ${id}`);
        } else {
          console.log(`Support message ${id} already exists, skipping...`);
        }
      } catch (error) {
        console.error(`Error importing support message: ${error.message}`);
      }
    }
    
    if (messagesToImport.length === 0) {
      console.log('No support messages data found in backup files.');
    }
    
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the import function
importData();