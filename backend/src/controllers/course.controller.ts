import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getCourseTree } from '../services/course.service';

export const getCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const data = await getCourseTree(id, userId);
    res.json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
