"use client";
import { type User } from "@/src/types/User";
import { User2Icon } from "lucide-react";
import Link from "next/link";

type MenuUser = {
  user: User;
};

export default function MenuUser({ user }: MenuUser) {
  return (
    <Link href={"/perfil"}>
      <div className="flex flex-col justify-center items-center border-black p-2 rounded-2xl max-w-20 hover:border">
        <User2Icon size={18} />
      </div>
    </Link>
  );
}
