"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/fitur_wajib/login");
    }
  }, []);

  return <h1 className="p-4">Dashboard</h1>;
}