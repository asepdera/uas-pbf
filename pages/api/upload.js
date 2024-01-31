import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    const filenameWithExtension = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, filenameWithExtension);
  },
});
const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Gunakan multer untuk upload file
      upload.single('image')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ success: false, error: err.message });
        } else if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }

        // Simpan gambar ke database menggunakan Prisma
        const { originalname, filename, path } = req.file;
        await prisma.image.create({
          data: {
            originalName: originalname,
            fileName: filename,
            filePath: path,
          },
        });
        const data = await prisma.image.findMany()

        res.status(200).json({ success: true, data });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
