import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  ip: string | null = null;

  @Column()
  mac: string | null = null;
}
