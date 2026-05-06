export interface Menu {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  children?: Menu[];
}

export interface MenuPayload {
  name: string;
  code: string;
  parentId: number | null;
}