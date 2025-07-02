
import {ICategory} from '@/lib/types/icategory' ;
export interface IProduct {
  _id: string
  image: string
  category: ICategory,
  createdAt?: Date
  updatedAt?: Date
}
