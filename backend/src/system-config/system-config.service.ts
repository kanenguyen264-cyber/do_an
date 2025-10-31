import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let config = await this.prisma.systemConfig.findFirst();
    if (!config) {
      config = await this.prisma.systemConfig.create({ data: {} });
    }
    return config;
  }

  async update(data: any) {
    const config = await this.get();
    return this.prisma.systemConfig.update({ where: { id: config.id }, data });
  }
}
