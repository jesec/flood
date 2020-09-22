export interface Disk {
  target: string;
  size: number;
  avail: number;
  used: number;
}

export type Disks = Array<Disk>;
