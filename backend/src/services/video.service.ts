import crypto from 'crypto';
import prisma from '../lib/prisma';

/**
 * Generates a Bunny.net signed URL for a video lesson.
 */
export const generateSignedVideoUrl = async (lessonId: string, userId: string, userIp: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } }
  });

  if (!lesson || !lesson.videoUrl) {
    throw new Error('Video not found');
  }

  const userCourse = await prisma.userCourse.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.module.courseId } }
  });

  if (!userCourse) {
    throw new Error('Access denied');
  }

  const hostname = process.env.BUNNY_CDN_HOSTNAME;
  const securityKey = process.env.BUNNY_CDN_TOKEN_KEY;

  if (!hostname || !securityKey) {
    throw new Error('CDN configuration missing');
  }

  const path = lesson.videoUrl;
  const expires = Math.floor(Date.now() / 1000) + 4 * 3600;

  const hashString = securityKey + path + expires;
  const hash = crypto.createHash('sha256').update(hashString).digest();
  const token = hash.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `https://${hostname}${path}?token=${token}&expires=${expires}`;
};
