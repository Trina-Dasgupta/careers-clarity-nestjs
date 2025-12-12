import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete, HttpCode } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

class CreatePlaylistDto {
  @ApiProperty({ example: 'My Algorithms Playlist' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A curated list of algorithm practice problems', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

class AddProblemsDto {
  @ApiProperty({ example: ['6f1d2a8b-1111-2222-3333-abcdef012345'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  problemIds: string[];
}

@ApiTags('Playlists')
@ApiBearerAuth('access-token')
@Controller('playlist')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getPlayAllListDetails(@Req() req: any) {
    const playLists = await this.playlistsService.getAllPlaylistsForUser(req.user.id);
    return { success: true, message: 'Playlists fetched successfully', playLists };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':playlistId')
  async getPlayListDetails(@Req() req: any, @Param('playlistId') playlistId: string) {
    const playList = await this.playlistsService.getPlaylistDetails(req.user.id, playlistId);
    return { success: true, message: 'Playlist fetched successfully', playList };
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-playlist')
  @ApiBody({
    schema: {
      example: {
        name: 'My Algorithms Playlist',
        description: 'A curated list of algorithm practice problems'
      }
    }
  })
  @ApiOperation({ summary: 'Create a playlist' })
  async createPlayList(@Req() req: any, @Body() body: CreatePlaylistDto) {
    const userId = req.user.id;
    const { name, description } = body;
    const playList = await this.playlistsService.createPlaylist(userId, name, description);
    return { success: true, message: 'Playlist created successfully', playList };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':playlistId/add-problem')
  @ApiBody({
    schema: {
      example: {
        problemIds: ['6f1d2a8b-1111-2222-3333-abcdef012345', '9a2b3c4d-4444-5555-6666-fedcba543210']
      }
    }
  })
  async addProblemToPlaylist(@Param('playlistId') playlistId: string, @Body() body: AddProblemsDto) {
    const { problemIds } = body;
    const problemsInPlaylist = await this.playlistsService.addProblemsToPlaylist(playlistId, problemIds);
    return { success: true, message: 'Problems added to playlist successfully', problemsInPlaylist };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':playlistId')
  @HttpCode(200)
  async deletePlayList(@Req() req: any, @Param('playlistId') playlistId: string) {
    const deletedPlaylist = await this.playlistsService.deletePlaylist(req.user.id, playlistId);
    return { success: true, message: 'Playlist deleted successfully', deletedPlaylist };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':playlistId/remove-problem')
  @HttpCode(200)
  @ApiBody({
    schema: {
      example: {
        problemIds: ['6f1d2a8b-1111-2222-3333-abcdef012345']
      }
    }
  })
  async removeProblemFromPlaylist(@Param('playlistId') playlistId: string, @Body() body: AddProblemsDto) {
    const { problemIds } = body;
    const deletedProblem = await this.playlistsService.removeProblemsFromPlaylist(playlistId, problemIds);
    return { success: true, message: 'Problem removed from playlist successfully', deletedProblem };
  }
}