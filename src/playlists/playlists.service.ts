import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlaylistsService {
  constructor(private prisma: PrismaService) {}

  async createPlaylist(userId: string, name: string, description?: string) {
    const playlist = await this.prisma.playlist.create({
      data: {
        name,
        description,
        user: { connect: { id: userId } },
      },
    });
    return playlist;
  }

  async getAllPlaylistsForUser(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        problems: {
          include: { problem: true },
        },
      },
    });
  }

  async getPlaylistDetails(userId: string, playlistId: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { problems: { include: { problem: true } } },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException('Not allowed');
    return playlist;
  }

  async addProblemsToPlaylist(playlistId: string, problemIds: string[]) {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      throw new BadRequestException('Invalid or missing problemIds');
    }

    const data = problemIds.map((problemId) => ({ playListId: playlistId, problemId }));

    const result = await this.prisma.problemInPlaylist.createMany({ data, skipDuplicates: true });
    return result;
  }

  async deletePlaylist(userId: string, playlistId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException('Not allowed');
    return this.prisma.playlist.delete({ where: { id: playlistId } });
  }

  async removeProblemsFromPlaylist(playlistId: string, problemIds: string[]) {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      throw new BadRequestException('Invalid or missing problemIds');
    }

    const result = await this.prisma.problemInPlaylist.deleteMany({
      where: { playListId: playlistId, problemId: { in: problemIds } },
    });
    return result;
  }
}
