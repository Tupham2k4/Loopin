import { Inngest } from "inngest";
import User from "../models/User.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "loopin-app",
});

// Sync User Creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      let username = email_addresses[0].email_address.split("@")[0];

      // Check username availability
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        username = username + Math.floor(Math.random() * 10000);
      }

      const userData = {
        _id: id,
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
        username,
      };

      await User.create(userData);

      console.log("User created successfully");
    } catch (error) {
      console.log(error.message);
    }
  },
);

// Sync User Update
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } =
        event.data;

      const updatedUserData = {
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
      };

      await User.findByIdAndUpdate(id, updatedUserData);

      console.log("User updated successfully");
    } catch (error) {
      console.log(error.message);
    }
  },
);

// Sync User Deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    try {
      const { id } = event.data;

      await User.findByIdAndDelete(id);

      console.log("User deleted successfully");
    } catch (error) {
      console.log(error.message);
    }
  },
);

// Export all functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
