import { storage } from "./server/storage";

async function testDatabaseConnection() {
  try {
    console.log("Testing database connection through storage interface...");
    
    // Test getting user by ID
    const user = await storage.getUser(1);
    console.log("User retrieved by ID:", user ? `${user.username} (${user.fullName})` : "Not found");
    
    // Test getting user by username
    const userByUsername = await storage.getUserByUsername("avictgboy@gmail.com");
    console.log("User retrieved by username:", userByUsername ? `${userByUsername.username} (${userByUsername.fullName})` : "Not found");
    
    console.log("Database connection test completed successfully!");
  } catch (error) {
    console.error("Error testing database connection:", error);
  }
}

testDatabaseConnection();