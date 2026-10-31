"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common/card";

type QueueItem = {
  id: string;
  serialNumber: number;
  status: string;
  patient: {
    user: {
      name: string;
    };
  };
};

type QueueResponse = {
  currentSerial: number;
  total: number;
  queue: QueueItem[];
};

export function DoctorQueue({ doctorId }: { doctorId: string }) {
  const [data, setData] = useState<QueueResponse | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/doctors/${doctorId}/queue`);
        if (!res.ok) return;
        const payload = await res.json();
        if (active && payload.success && payload.data) {
          setData(payload.data);
        }
      } catch (err) {
        console.error("Failed to load doctor queue:", err);
      }
    };

    void load();
    const timer = setInterval(load, 6000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [doctorId]);

  if (!data) {
    return <Card>Loading queue...</Card>;
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold">Live Queue</h3>
      <p className="mt-1 text-sm text-zinc-500">Current serial: {data.currentSerial || "-"}</p>
      <div className="mt-4 space-y-2">
        {data.queue.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
            <span>#{item.serialNumber}</span>
            <span>{item.patient.user.name}</span>
            <span>{item.status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
