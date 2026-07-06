import computerVisionVideo from "../../../assets/course_videos/Computer Vision.mp4";
import generativeAiVideo from "../../../assets/course_videos/Generative AI.mp4";
import machineLearningVideo from "../../../assets/course_videos/Machine Learning.mp4";
import mathematicalOptimizationVideo from "../../../assets/course_videos/Mathematical Optimization.mp4";
import reinforcementLearningVideo from "../../../assets/course_videos/Reinforcement Learning.mp4";
import visualOdometryVideo from "../../../assets/course_videos/Visual Odometry.mp4";
import heroBannerVideo from "../../../assets/course_videos/Hero-banner.mp4";

export const getCourseVideo = (title: string): string => {
  const t = (title || "").toLowerCase();
  if (t.includes("machine learning")) {
    return machineLearningVideo;
  }
  if (t.includes("computer vision")) {
    return computerVisionVideo;
  }
  if (t.includes("generative ai") || t.includes("genai")) {
    return generativeAiVideo;
  }
  if (t.includes("mathematical optimization")) {
    return mathematicalOptimizationVideo;
  }
  if (t.includes("reinforcement learning")) {
    return reinforcementLearningVideo;
  }
  if (t.includes("visual odometry") || t.includes("robotics and visual navigation")) {
    return visualOdometryVideo;
  }
  return heroBannerVideo;
};
