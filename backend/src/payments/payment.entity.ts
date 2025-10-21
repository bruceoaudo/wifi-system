import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Payment {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  planSlug: string;

  @Column()
  planName: string;

  @Column()
  amount: number;

  @Column()
  phone: string;

  @Column()
  status: 'pending' | 'success' | 'failed';

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  checkoutRequestId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
