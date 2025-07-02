export interface IMenu {
  _id: string;
  name: string;
  link: string;
  slug: string;
  icon?: string;
  children?:  IMenu[] ,
  order: number;
  parentId?: string | null;
  isActive: boolean;
}