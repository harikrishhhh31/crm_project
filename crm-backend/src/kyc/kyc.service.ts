import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KycDocument } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async processUpload(file: Express.Multer.File, userId: string, customerId?: string) {
    const aiUrl = this.config.getOrThrow('AI_SERVICE_URL');
    const apiKey = this.config.getOrThrow('AI_SERVICE_API_KEY');

    const form = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
    form.append('file', blob, file.originalname);

    const res = await fetch(`${aiUrl}/api/v1/kyc/upload`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey },
      body: form,
    });
    if (!res.ok) {
      throw new InternalServerErrorException(
        `AI service error: ${res.status} ${await res.text()}`,
      );
    }
    const result = await res.json();

    return this.prisma.kycDocument.create({
      data: {
        customerId,
        uploadedById: userId,
        fileId: result.file_id,
        filename: result.filename,
        storedAs: result.stored_as,
        documentType: result.document_type,
        extractedText: result.extracted_text ?? null,
        fields: result.fields ?? {},
        validationValid: result.validation?.valid ?? false,
        validationErrors: result.validation?.errors ?? [],
        confidence: result.confidence ?? 0,
        verificationStatus: result.verification_status ?? 'pending',
      },
    });
  }

  findAll(customerId?: string) {
    return this.prisma.kycDocument.findMany({
      where: customerId ? { customerId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const doc = await this.prisma.kycDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException();
    if (role !== 'ADMIN' && role !== 'MANAGER' && doc.uploadedById !== userId) {
      throw new ForbiddenException();
    }
    return doc;
  }

  async updateStatus(id: string, status: string, role: string) {
    if (role !== 'ADMIN' && role !== 'MANAGER') throw new ForbiddenException();
    return this.prisma.kycDocument.update({
      where: { id },
      data: { verificationStatus: status },
    });
  }

  async remove(id: string, role: string) {
    if (role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.kycDocument.delete({ where: { id } });
  }
}
