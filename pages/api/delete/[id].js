import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    await prisma.image.delete({
      where: { id: parseInt(id) },
    });

    // Delete the image file from the file system
    const imagePath = path.join(process.cwd(), image.filePath);
    fs.unlinkSync(imagePath);
    const data = await prisma.image.findMany()

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}
