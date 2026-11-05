export type Location = {
  locationId: string;
  name: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
};

export type CreateLocationInput = {
  name: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
};

export type UpdateLocationInput = Partial<CreateLocationInput>;
