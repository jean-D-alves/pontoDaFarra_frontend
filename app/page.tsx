import Header from "@/src/components/header/Header";
import { useUser } from "@/src/Context/UserContext";

export default function Page() {
  const { user } = useUser();
  return <div></div>;
}
