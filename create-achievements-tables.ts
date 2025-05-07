import { db } from './server/db';
import { 
  achievements, 
  achievementCategoryEnum, 
  achievementDifficultyEnum,
  userAchievements 
} from './shared/schema';

/**
 * This script creates the achievement-related tables and populates them with initial data
 */
async function createAchievementTables() {
  console.log('Creating achievement category enum...');
  await db.execute`CREATE TYPE IF NOT EXISTS achievement_category AS ENUM (
    'transaction_volume', 'player_acquisition', 'retention', 'consistency', 'special'
  )`;

  console.log('Creating achievement difficulty enum...');
  await db.execute`CREATE TYPE IF NOT EXISTS achievement_difficulty AS ENUM (
    'bronze', 'silver', 'gold', 'platinum', 'diamond'
  )`;

  console.log('Creating achievements table...');
  await db.execute`
    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category achievement_category NOT NULL,
      difficulty achievement_difficulty NOT NULL,
      points_awarded INTEGER NOT NULL DEFAULT 0,
      icon TEXT NOT NULL,
      requirement JSONB NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  console.log('Creating user_achievements table...');
  await db.execute`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      achievement_id INTEGER NOT NULL REFERENCES achievements(id),
      progress NUMERIC(10, 2) DEFAULT 0 NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMP,
      points_awarded INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;

  // Create initial achievements
  console.log('Creating initial achievements...');
  await db.insert(achievements).values([
    // Transaction volume achievements
    {
      title: 'First Steps',
      description: 'Process your first 10 transactions',
      category: 'transaction_volume',
      difficulty: 'bronze',
      pointsAwarded: 10,
      icon: 'baby-steps',
      requirement: { transaction_count: 10 },
      isActive: true,
    },
    {
      title: 'Volume Master',
      description: 'Process transactions worth over 100,000 BDT',
      category: 'transaction_volume',
      difficulty: 'silver',
      pointsAwarded: 50,
      icon: 'money-stack',
      requirement: { transaction_volume: 100000 },
      isActive: true,
    },
    {
      title: 'Transaction Tycoon',
      description: 'Process over 100 transactions',
      category: 'transaction_volume',
      difficulty: 'gold',
      pointsAwarded: 100,
      icon: 'tycoon',
      requirement: { transaction_count: 100 },
      isActive: true,
    },
    // Player acquisition achievements
    {
      title: 'Player Recruiter',
      description: 'Recruit your first 5 players',
      category: 'player_acquisition',
      difficulty: 'bronze',
      pointsAwarded: 20,
      icon: 'recruiter',
      requirement: { player_count: 5 },
      isActive: true,
    },
    {
      title: 'Player Magnet',
      description: 'Recruit 20 active players',
      category: 'player_acquisition',
      difficulty: 'silver',
      pointsAwarded: 75,
      icon: 'magnet',
      requirement: { active_player_count: 20 },
      isActive: true,
    },
    // Retention achievements
    {
      title: 'Retention King',
      description: 'Maintain 80% player retention for 30 days',
      category: 'retention',
      difficulty: 'gold',
      pointsAwarded: 150,
      icon: 'crown',
      requirement: { retention_percentage: 80, days: 30 },
      isActive: true,
    },
    // Consistency achievements
    {
      title: 'Consistency Award',
      description: 'Log in for 7 consecutive days',
      category: 'consistency',
      difficulty: 'bronze',
      pointsAwarded: 15,
      icon: 'calendar',
      requirement: { consecutive_days: 7 },
      isActive: true,
    },
    // Special achievements
    {
      title: 'First Transaction',
      description: 'Complete your first transaction',
      category: 'special',
      difficulty: 'bronze',
      pointsAwarded: 5,
      icon: 'star',
      requirement: { transaction_count: 1 },
      isActive: true,
    },
  ]).onConflictDoNothing();

  console.log('Achievements tables created and initialized!');
}

createAchievementTables()
  .then(() => {
    console.log('Achievement system setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error setting up achievement system:', error);
    process.exit(1);
  });