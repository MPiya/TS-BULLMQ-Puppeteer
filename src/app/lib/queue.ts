import { Queue } from "bullmq";

import { connection } from "@/app/lib/redis";

export const importQueue = new Queue("importQueue", {
  connection,
  defaultJobOptions: {
    attempts: 2,  
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
});
