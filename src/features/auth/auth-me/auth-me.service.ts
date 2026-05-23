import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AuthMeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleProfile: {
          select: { name: true, defaultPermissions: true },
        },
        tenantId: true,
        mustChangePassword: true,
        createdAt: true,
        profileImageUrl: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}
