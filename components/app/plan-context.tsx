"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { DEMO_PLAN, PLAN_LABEL, type Plan } from "@/lib/demo/data";

interface PlanContextValue {
  plan: Plan;
  setPlan: (p: Plan) => void;
  planLabel: (lang: "tr" | "en") => string;
  atLeast: (required: Plan) => boolean;
}

const ORDER: Plan[] = ["solo", "pro", "isletme"];

const PlanContext = createContext<PlanContextValue>({
  plan: DEMO_PLAN,
  setPlan: () => {},
  planLabel: (lang) => PLAN_LABEL[DEMO_PLAN][lang],
  atLeast: (required) => ORDER.indexOf(DEMO_PLAN) >= ORDER.indexOf(required),
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>(DEMO_PLAN);
  return (
    <PlanContext.Provider
      value={{
        plan,
        setPlan,
        planLabel: (lang) => PLAN_LABEL[plan][lang],
        atLeast: (required) => ORDER.indexOf(plan) >= ORDER.indexOf(required),
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
