export type User = {
    userId      : string;
    name        : string;
    email       : string;
    phoneNumber : string;
    role        : "Admin" | "Client";
};