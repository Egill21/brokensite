const cloudinary = require('cloudinary');

const {
    CLOUDINARY_CLOUD,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
  } = process.env;
  
if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.warn('Missing cloudinary config, uploading images will not work');
}
  
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});


async function uploadImage(path) {
    let upload = null;
    try {
        upload = await cloudinary.v2.uploader.upload(path, allowed_formats = ['jpg', 'png', 'gif']);
    } catch (error) {
        if (error.http_code && error.http_code === 400) {
            console.error(error);
            return { error: error.message };
        }
        console.error('Unable to upload file to cloudinary:', path);
        console.error(error);
        return { error: 'Error uploading image' };
    }
    return upload.secure_url;
}

module.exports = {
    uploadImage,
}