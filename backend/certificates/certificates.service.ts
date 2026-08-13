import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

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
    return cert;
  }
}
