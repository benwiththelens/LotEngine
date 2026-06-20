"use server";

import { decodeVin } from "./vin-service";

export async function lookupPlate(plate: string, state: string) {
  // NOTE: Real-world plate lookups usually require a paid API like Carfax, VinAudit, or Infotracer.
  // For this LotEngine MVP/Prototype, we are implementing the UI flow and using a mock resolver 
  // that simulates the resolution to a VIN, which then triggers the standard NHTSA decode.

  // Do not log plates — they are PII in most jurisdictions.
  console.log("Plate lookup initiated.");

  // Simulate API Latency
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock Logic: In a real app, this would hit a service to return a VIN.
  // For the demo, we'll return a known VIN if they use a specific "magic" plate, 
  // otherwise we'll throw a helpful error about the demo limitations.
  
  if (plate.toUpperCase() === "LOTENGINE") {
    return {
      vin: "1FADP3K94HL123456", // Example Focus ST VIN
      status: "resolved"
    };
  }

  // Realistic fallback for demo
  throw new Error("Plate-to-VIN resolution requires active Carfax/VinAudit API credentials. Use plate 'LOTENGINE' for system test.");
}
