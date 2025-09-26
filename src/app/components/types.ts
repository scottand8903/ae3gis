export type SidebarItem = {
  type: "SIDEBAR_ITEM";
  name: string;
  templateId: string;
};

export type BoxItem = {
  type: "BOX";
  id: number;
  name: string;
  left: number;
  top: number;
  mouseOffset?: { x: number; y: number };
};

export type DndItem = SidebarItem | BoxItem;
