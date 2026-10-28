import { type User } from "../types/User";

export async function requestUpdateUser(
  name: string,
  email: string,
  phoneNumber: string,
) {
  const response = await fetch("/api/user/update", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Name: name,
      Email: email,
      PhoneNumber: phoneNumber,
    }),
  });

  if (!response.ok) return null;
  return response.json();
}

export async function requestDeleteUser() {
  const response = await fetch("/api/user/delete", {
    method: "DELETE",
    credentials: "include",

  });

  if (!response.ok) return null;
  return response.ok;
}
