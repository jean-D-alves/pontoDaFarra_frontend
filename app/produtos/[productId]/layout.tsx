import Header from "@/src/components/header/Header";
import { UserProvider } from "@/src/Context/UserContext";

export default function ProductLayout({
  children,
}: LayoutProps<"/produtos/[productId]">) {
  return (
      <body className="min-h-full flex flex-col">
        <Header />

        {children}
      </body>
  );
}
