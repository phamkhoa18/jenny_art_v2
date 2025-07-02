export interface ICategory {
  _id: string ,
  name: string;
  link: string ;
  slug: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}