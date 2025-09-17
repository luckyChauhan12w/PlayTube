import dotenv from "dotenv"
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    const absoluteFilePath = path.join(process.cwd(), localFilePath);

    console.log("uploadOnCloudinary", absoluteFilePath);

    try {
        if (!absoluteFilePath) return null;

        const result = await cloudinary.uploader.upload(absoluteFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(absoluteFilePath);

        return result;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        fs.unlinkSync(absoluteFilePath);
        return null;
    }
};

export default uploadOnCloudinary;