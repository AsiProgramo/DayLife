const path = require("path");

// carpeta donde se guardan las imágenes subidas
const UPLOAD_DIR = path.join(__dirname, "../public/upload");

module.exports = {
    UPLOAD_DIR,
    TEMP_DIR: path.join(UPLOAD_DIR, "temp"),
};
