import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';
import * as uploadService from '../services/upload.service';

export const listCourses = async (req: Request, res: Response) => {
  try {
    const courses = await adminService.getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await adminService.createCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await adminService.updateCourse(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    await adminService.deleteCourse(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createModule = async (req: Request, res: Response) => {
  try {
    const module = await adminService.createModule(req.params.courseId, req.body);
    res.status(201).json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const module = await adminService.updateModule(req.params.id, req.body);
    res.json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    await adminService.deleteModule(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await adminService.createLesson(req.params.moduleId, req.body);
    res.status(201).json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const lesson = await adminService.updateLesson(req.params.id, req.body);
    res.json(lesson);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    await adminService.deleteLesson(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const presignUpload = async (req: Request, res: Response) => {
  try {
    const { courseId, fileName } = req.body;
    // For Express request handlers with no explicit return type
    if (!courseId || !fileName) {
      res.status(400).json({ error: 'Missing courseId or fileName' });
      return;
    }
    const data = uploadService.generatePresignedUpload(courseId, fileName);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
