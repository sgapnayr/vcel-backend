"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { User } from "../../types/type";

export default function Home() {
  const [, setData] = useState<User>();

  async function getData() {
    try {
      const res = await axios.post("/api/user");
      setData(res.data as User);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  async function postData() {
    const res = await axios.post("/api/email", {
      email: "tefdsafdsafssast@gmail.com",
      name: "Ryan",
    });
    console.log(res.data);
  }

  return (
    <div className="flex min-h-screen w-full justify-center items-center">
      <button onClick={postData}>Post Email</button>
    </div>
  );
}
