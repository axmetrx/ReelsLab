import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateSignedVideoUrl } from '../services/video.service';

export const getSignedUrl = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const userIp = req.ip || '127.0.0.1';
    const url = await generateSignedVideoUrl(id, userId, userIp);
    res.json({ url });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
