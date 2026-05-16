import { redirect } from "next/navigation";

export default function HomePage() {
  // Kullanıcı kök dizine (/) girdiğinde anında /admin'e yönlendirilir
  redirect("/admin");
}