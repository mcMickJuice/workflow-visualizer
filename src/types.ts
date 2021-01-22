export interface StepCoordinate {
  x: number;
  y: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Workflow {
  id: string;
  nextId?: string;
  name: string;
  order: number;
}

export type Orientation = "vertical" | "horizontal";
