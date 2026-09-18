// backend/src/modules/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksResolver } from './tasks.resolver';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';
import { RedisModule } from '../redis/redis.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Task, TaskAssignment]), // ✅ Add TaskAssignment
        RedisModule,
        AuthModule,
        UsersModule,
    ],
    providers: [TasksResolver, TasksService],
    exports: [TasksService],
})
export class TasksModule {}
