export type Alert = {
  _id: string;
  coinName: string;
  coinSymbol: string;
  condition: "above" | "below";
  targetPrice: number;
  isActive: boolean;
  triggeredAt?: string | null;
  createdAt: string;
};
