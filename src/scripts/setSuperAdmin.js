import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import SiteSetting from "../models/SiteSetting.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const targetStudentId = "251035003";
    const rawPassword = "524494";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let user = await User.findOne({ studentId: targetStudentId });
    if (user) {
      user.password = hashedPassword;
      user.role = "superadmin";
      if (!user.name || user.name === "User") {
        user.name = "Super Admin";
      }
      await user.save();
      console.log(`Updated existing user ${targetStudentId} to superadmin with new password.`);
    } else {
      user = await User.create({
        name: "Super Admin",
        studentId: targetStudentId,
        password: hashedPassword,
        role: "superadmin",
        lastLogin: new Date(),
        lastActive: new Date(),
      });
      console.log(`Created new superadmin user ${targetStudentId}.`);
    }

    // Also update existing SiteSetting document in DB to ADS 252
    const setting = await SiteSetting.findOne();
    if (setting) {
      if (setting.examRoutine) {
        setting.examRoutine.title = (setting.examRoutine.title || "ADS 252 Exam Routine").replace(/251/g, "252");
      }
      if (setting.classRoutine) {
        setting.classRoutine.title = (setting.classRoutine.title || "ADS 252 Class Routine").replace(/251/g, "252");
      }
      if (setting.heroSlides && setting.heroSlides.length > 0) {
        setting.heroSlides.forEach((slide) => {
          if (slide.subtitle) {
            slide.subtitle = slide.subtitle.replace(/251/g, "252");
          }
          if (slide.title) {
            slide.title = slide.title.replace(/251/g, "252");
          }
        });
      }
      await setting.save();
      console.log("Updated SiteSetting in database to ADS 252:", setting);
    }

    console.log("Super Admin Account Details:");
    console.log("Name:", user.name);
    console.log("Student ID:", user.studentId);
    console.log("Role:", user.role);

    process.exit(0);
  } catch (err) {
    console.error("Error setting super admin:", err);
    process.exit(1);
  }
};

run();
