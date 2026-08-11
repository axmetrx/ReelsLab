import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { completeLesson } from '../services/lesson.service';

export const markLessonComplete = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const data = await completeLesson(id, userId);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
