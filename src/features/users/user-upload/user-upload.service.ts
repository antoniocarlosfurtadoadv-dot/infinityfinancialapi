import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';

import { PrismaService } from 'src/core/database/prisma.service';
import { StorageService } from 'src/core/integrations/storage/storage.service';

@Injectable()
export class UserUploadService {

  private readonly logger = new Logger(UserUploadService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    console.log('User found:', user);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.profileImageUrl) {
      try {
        const oldKey = new URL(user.profileImageUrl).pathname.slice(1);
        await this.storageService.deleteFile({ key: oldKey });

      } catch (error) {
        this.logger.error('Failed to delete old profile image', error);
      }
    }

    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `users/${userId}/profile.${ext}`;

    const result = await this.storageService.uploadFile({
      file: file.buffer,
      filename: key,
      contentType: file.mimetype,
    });
    console.log('Upload result:', result);

    if (!result.success) {
      throw new BadRequestException('Falha ao enviar o arquivo');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profileImageUrl: result.url },
    });


    console.log('Updated user:', updatedUser);

    return { profileImageUrl: result.url };
  }
}
