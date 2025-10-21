import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity()
export class Plan {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column()
  price: number;

  @Column()
  duration: string;

  @Column()
  description: string;
}
