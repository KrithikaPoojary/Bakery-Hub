import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const updateProfile = async (req, res) => {
  try {
    let avatarUrl = null;

    if (req.file) {
      const upload = await uploadToCloudinary(req.file.path);
      avatarUrl = upload.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name: req.body.name,
        phone: req.body.phone,
        gender: req.body.gender,
        dob: req.body.dob,
        location: req.body.location,
        ...(avatarUrl && { avatarUrl }),
      },
      { new: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
};
