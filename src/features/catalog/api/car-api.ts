import { cars } from "../data/cars";
import type { Car } from "../model/car";

export type CarApi = {
  listCars(): readonly Car[];
  getCar(id: string): Car | undefined;
};

export const carApi: CarApi = {
  listCars() {
    return cars;
  },

  getCar(id) {
    return cars.find((car) => car.id === id);
  },
};
