import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserPayload } from 'src/shared/interfaces';
import { tenantFilter } from 'src/shared/utils/tenant-filter';



@Injectable()
export class UserFindService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(userId: string, currentUser: UserPayload) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
        ...tenantFilter(currentUser.tenantId),
      },
      select: {
        id: true,
        email: true,
        name: true,
        roleProfile: { select: { id: true, name: true } },
        tenantId: true,
        profileImageUrl: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }



    return user;
  }

}
