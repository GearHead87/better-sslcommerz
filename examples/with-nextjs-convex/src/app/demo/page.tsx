"use client";

import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export default function Home() {
  const tasks = useQuery(api.tasks.get);
  const [newTask, setNewTask] = useState("");
  const addTask = useMutation(api.tasks.add);
  const handleAddTask = () => {
    addTask({ text: newTask });
    setNewTask("");
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {tasks?.map(({ _id, text }) => <div key={_id}>{text}</div>)}
      <input placeholder="Add a new task" type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
      <button onClick={handleAddTask}>Add</button>
    </main>
  );
}