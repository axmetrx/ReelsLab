import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { getCourse } from './controllers/course.controller';
import { markLessonComplete } from './controllers/lesson.controller';
import { getSignedUrl } from './controllers/video.controller';
import { listCourses, createCourse, updateCourse, deleteCourse, createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson, presignUpload } from './controllers/admin.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());

const courseRouter = express.Router();
courseRouter.get('/:id', getCourse);
courseRouter.get('/:id/tree', getCourse);

const lessonRouter = express.Router();
lessonRouter.post('/:id/complete', markLessonComplete);

const videoRouter = express.Router();
videoRouter.get('/:id/signed-url', getSignedUrl);

app.use('/api', authMiddleware);
app.use('/api/courses', courseRouter);
app.use('/api/lessons', lessonRouter);
app.use('/api/videos', videoRouter);

const adminRouter = express.Router();
adminRouter.get('/courses', listCourses);
adminRouter.post('/courses', createCourse);
adminRouter.put('/courses/:id', updateCourse);
adminRouter.delete('/courses/:id', deleteCourse);
adminRouter.post('/courses/:courseId/modules', createModule);
adminRouter.put('/modules/:id', updateModule);
adminRouter.delete('/modules/:id', deleteModule);
adminRouter.post('/modules/:moduleId/lessons', createLesson);
adminRouter.put('/lessons/:id', updateLesson);
adminRouter.delete('/lessons/:id', deleteLesson);
adminRouter.post('/upload/presign', presignUpload);

app.use('/api/admin', adminRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
