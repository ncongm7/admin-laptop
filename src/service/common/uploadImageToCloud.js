// 📁 src/utils/
/**
 * Hàm upload ảnh lên cloudinary
 * @param {File} file -anh can upload
 * @returns {Promise<string>} - URL của ảnh đã upload
 */
export async function uploadImageToCloudinary(file) {
    const CLOUD_NAME = 'di5ziydep';
    const UPLOAD_PRESET = 'project-finace-manager';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            return data.secure_url; // ✅ Đây là URL ảnh bạn dùng để lưu vào DB
        } else {
            throw new Error('Không nhận được secure_url từ Cloudinary');
        }
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        throw error;
    }
}

    