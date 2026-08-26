import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AnalyticsService } from '../src/analytics/analytics.service';

@Injectable()
export class CertificatesService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  async myCertificates(studentId: number) {
    return await this.prisma.certificates.findMany({
      where: { Student_Id: studentId },
      include: { Courses: { select: { Title: true } } },
      orderBy: { IssuedAt: 'desc' },
    });
  }

  async getOne(id: number, studentId: number) {
    const cert = await this.prisma.certificates.findUnique({
      where: { Id: id },
      include: {
        Courses: { select: { Title: true } },
        Users: { select: { FirstName: true, LastName: true } },
      },
    });
    if (!cert || cert.Student_Id !== studentId) {
      throw new NotFoundException('گواهینامه یافت نشد.');
    }

    // Enrich with skill breakdown for the linked attempt (read-side only —
    // the original transaction is untouched).
    let skillBreakdown: ReturnType<AnalyticsService['groupBySkill']> = [];
    try {
      const result = await this.analyticsService.getAttemptSkills(
        cert.Attempt_Id,
        { id: studentId, roleId: 1 }, // student context — owns the attempt
      );
      skillBreakdown = result.skills;
    } catch {
      // Non-fatal: if no answers exist yet (edge case), return empty array
      skillBreakdown = [];
    }

    return { ...cert, skillBreakdown };
  }
}
