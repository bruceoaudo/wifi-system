import { forwardRef, Module } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { MikrotikRouterModule } from 'src/router/router.module';
import { CustomerInfoService } from './customer-info.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
  imports: [
    MikrotikRouterModule,
    AuthModule,
    UsersModule,
    forwardRef(() => PaymentsModule),
    TasksModule,
  ],
  providers: [MpesaService, CustomerInfoService],
  controllers: [MpesaController],
  exports: [MpesaService],
})
export class MpesaModule {}
