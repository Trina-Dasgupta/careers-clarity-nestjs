import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './files/files.module';
import { ProblemsModule } from './problems/problems.module';
import { ExecuteModule } from './execute/execute.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { TrendingModule } from './trending/trending.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    FilesModule,
    ProblemsModule,
    ExecuteModule,
    SubmissionsModule,
    PlaylistsModule,
    TrendingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
