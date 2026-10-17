export const CAR_TYPES = ["sedan", "suv", "hatchback", "coupe", "truck", "electric"] as const;
export type CarType = (typeof CAR_TYPES)[number];

export const FUEL_TYPES = ["gasoline", "hybrid", "electric"] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const DRIVETRAINS = ["fwd", "rwd", "awd"] as const;
export type Drivetrain = (typeof DRIVETRAINS)[number];

export const TRANSMISSIONS = ["automatic", "manual"] as const;
export type Transmission = (typeof TRANSMISSIONS)[number];

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: CarType;
  price: number;
  weightKg: number;
  rating: number;
  reviewCount: number;
  horsepower: number;
  fuelType: FuelType;
  transmission: Transmission;
  drivetrain: Drivetrain;
  seats: number;
  imageSrc: string;
  imageAlt: string;
};

export const CAR_TYPE_LABELS: Record<CarType, string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  coupe: "Coupe",
  truck: "Truck",
  electric: "Electric",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: "Gasoline",
  hybrid: "Hybrid",
  electric: "Electric",
};

export const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  fwd: "FWD",
  rwd: "RWD",
  awd: "AWD",
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  automatic: "Automatic",
  manual: "Manual",
};

export function isCarType(value: string): value is CarType {
  return CAR_TYPES.some((type) => type === value);
}
