import api from "./api";
export interface SaveLearningOutcomesDto {
  items: string[];
}

export interface SavePrerequisitesDto {
  items: string[];
}
export interface CourseEnrollmentReportItem {
  courseId: number;
  title: string;
  enrollments: number;
}
export interface CourseStudent {
  studentId: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatar: string | null;
  enrollmentDate: string | null;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  hasParticipatedInExam: boolean;
  score: number | null;
  maxScore: number | null;
  isPassed: boolean | null;
}

export interface BrowseCoursesParams {
  search?: string;
  categoryId?: number;
  levelId?: number;
  teacherId?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface BrowseCoursesResponse {
  data: Course[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateCourseData {
  title: string;
  shortDescription?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  categoryId: number;
  levelId?: number;
  durationMinutes?: number;
  thumbnail?: string;
}

export interface Category {
  Id: number;
  Title: string;
  Description?: string;
  Icon?: string;
}

export interface Level {
  Id: number;
  LevelName: string;
}

export interface MyCourse {
  Id: number;
  Title: string;
  Thumbnail: string | null;
  Price: number;
  DiscountPrice: number | null;
  IsPublished: boolean;
  CreatedAt: string;
  AverageRating: number;
  Category: {
    Id: number;
    Title: string;
  };
  Level: {
    Id: number;
    LevelName: string;
  } | null;
}

export interface Course {
  Id: number;
  Title: string;
  Description: string | null;
  Price: number;
  DiscountPrice: number | null;
  IsPublished: boolean;
  CreatedAt: string;
  Slug: string | null;
  Thumbnail: string | null;
  ShortDescription: string | null;
  DurationMinutes: number | null;
  AverageRating: number;
  Category: { Id: number; Title: string };
  Level: { Id: number; LevelName: string } | null;
  Users?: { Id: number; FirstName: string; LastName: string };
  CourseSections?: Section[];
  isEnrolled: boolean;
  CoursePrequisties: [];
  CourseLearningOutcomes: [];
  enrollmentDate?: string | null;
  enrollmentStatus?: number | null;
  completedLessonIds?: number[];
  progressPercent?: number;
}

export interface Section {
  Id: number;
  Title: string;
  DisplayOrder: number | null;
  Course_Id: number;
  Description: string;
  CreatedAt: string;
  Lessons?: Lesson[];
}

export interface Lesson {
  Id: number;
  Title: string;
  Description: string | null;
  VideoUrl: string | null;
  VideoType: boolean;
  DurationMinutes: number | null;
  SortOrder: number | null;
  IsFreePreview: boolean;
  CreatedAt: string;
  IsPublished: boolean;
  Course_Id: number;
  Section_Id: number | null;
  LessonFiles?: LessonFile[];
}

export interface LessonFile {
  Id: number;
  Lesson_Id: number;

  FileName: string;
  FileUrl: string;

  FileType: boolean;

  FileSize: number;

  FileExtension: string;

  DownloadCount: number;

  CreatedAt: string;
}

export interface LessonProgress {
  Id: number;
  Course_Id: number;
  Lesson_Id: number;
  Student_Id: number;
  IsCompleted: boolean;
  CompletedAt: string | null;
}

class CourseService {
  async createCourse(data: CreateCourseData): Promise<Course> {
    const response = await api.post("/courses", data);
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get("/categories");
    return response.data;
  }

  async getLevels(): Promise<Level[]> {
    const response = await api.get("/levels");
    return response.data;
  }

  async getMyCourses(): Promise<MyCourse[]> {
    const response = await api.get("/courses/my");
    return response.data;
  }

  // Returns only published courses (backend filters IsPublished = true).
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get("/courses");
    return response.data;
  }

  async getCourse(id: number): Promise<Course> {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  }

  async updateCourse(
    id: number,
    data: Partial<CreateCourseData>,
  ): Promise<Course> {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await api.delete(`/courses/${id}`);
  }

  async publishCourse(id: number): Promise<Course> {
    const response = await api.put(`/courses/${id}/publish`);
    return response.data;
  }

  async getSections(courseId: number): Promise<Section[]> {
    const response = await api.get(`/courses/${courseId}/sections`);
    return response.data;
  }

  async createSection(
    courseId: number,
    data: { title: string; displayOrder?: number },
  ): Promise<Section> {
    const response = await api.post(`/courses/${courseId}/sections`, data);
    return response.data;
  }

  async updateSection(
    id: number,
    data: { title?: string; displayOrder?: number },
  ): Promise<Section> {
    const response = await api.put(`/sections/${id}`, data);
    return response.data;
  }

  async deleteSection(id: number): Promise<void> {
    await api.delete(`/sections/${id}`);
  }

  async getLessons(sectionId: number): Promise<Lesson[]> {
    const response = await api.get(`/sections/${sectionId}/lessons`);
    return response.data;
  }

  async createLesson(
    sectionId: number,
    data: {
      title: string;
      description?: string;
      videoUrl?: string;
      videoType?: boolean;
      durationMinutes?: number;
      displayOrder?: number;
      isFreePreview?: boolean;
    },
  ): Promise<Lesson> {
    const response = await api.post(`/sections/${sectionId}/lessons`, data);
    return response.data;
  }

  async updateLesson(
    id: number,
    data: {
      title?: string;
      description?: string;
      videoUrl?: string;
      videoType?: boolean;
      durationMinutes?: number;
      displayOrder?: number;
      isFreePreview?: boolean;
    },
  ): Promise<Lesson> {
    const response = await api.put(`/lessons/${id}`, data);
    return response.data;
  }

  async deleteLesson(id: number): Promise<void> {
    await api.delete(`/lessons/${id}`);
  }

  async getLessonFiles(lessonId: number): Promise<LessonFile[]> {
    const response = await api.get(`/lessons/${lessonId}/files`);
    return response.data;
  }

  async createLessonFile(
    lessonId: number,
    data: {
      fileName: string;
      fileUrl: string;
      fileType: boolean;
      fileSize: number;
      fileExtension: string;
    },
  ): Promise<LessonFile> {
    const response = await api.post(`/lessons/${lessonId}/files`, data);
    return response.data;
  }

  async deleteLessonFile(id: number): Promise<void> {
    await api.delete(`/lesson-files/${id}`);
  }
  async browseCourses(
    params: BrowseCoursesParams,
  ): Promise<BrowseCoursesResponse> {
    const response = await api.get("/courses/browse", {
      params,
    });

    return response.data;
  }

  // Admin view: all courses (published & unpublished) with filters + pagination
  async browseAdminCourses(
    params: BrowseCoursesParams,
  ): Promise<BrowseCoursesResponse> {
    const response = await api.get("/courses/admin", {
      params,
    });

    return response.data;
  }

  async getLearningOutcomes(courseId: number): Promise<string[]> {
    const response = await api.get(`/courses/${courseId}/learning-outcomes`);

    return response.data;
  }

  async saveLearningOutcomes(
    courseId: number,
    data: SaveLearningOutcomesDto,
  ): Promise<void> {
    await api.put(`/courses/${courseId}/learning-outcomes`, data);
  }

  async getPrerequisites(courseId: number): Promise<string[]> {
    const response = await api.get(`/courses/${courseId}/prerequisites`);

    return response.data;
  }

  async savePrerequisites(
    courseId: number,
    data: SavePrerequisitesDto,
  ): Promise<void> {
    await api.put(`/courses/${courseId}/prerequisites`, data);
  }
  async getEnrolledCourses(): Promise<Course[]> {
    const response = await api.get("/courses/enrolled");
    return response.data;
  }

  async updateLessonProgress(
    lessonId: number,
    isCompleted: boolean,
  ): Promise<LessonProgress> {
    const response = await api.put(`/lessons/${lessonId}/progress`, {
      isCompleted,
    });
    return response.data;
  }
  async getCourseStudents(courseId: number): Promise<CourseStudent[]> {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
  }
  async getEnrollmentsReport(): Promise<CourseEnrollmentReportItem[]> {
    const response = await api.get("/courses/my/enrollments-report");
    return response.data;
  }
}

export default new CourseService();
