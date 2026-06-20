"use server";

export async function decodeVin(vin: string) {
  if (!vin || vin.length !== 17) {
    throw new Error("Invalid VIN length. Must be 17 characters.");
  }

  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
  );

  if (!response.ok) {
    throw new Error("Failed to connect to NHTSA API.");
  }

  const data = await response.json();
  const results = data.Results;

  // Helper to find value by Variable name
  const getVal = (name: string) => results.find((r: { Variable: string; Value: string | null }) => r.Variable === name)?.Value;

  const displacement = getVal("Displacement (L)");
  const cylinders = getVal("Engine Number of Cylinders");

  return {
    year: parseInt(getVal("Model Year") || "0"),
    make: getVal("Make"),
    model: getVal("Model"),
    trim: getVal("Trim"),
    engine: displacement && cylinders
      ? `${displacement}L ${cylinders}cyl`
      : getVal("Engine Model") || null,
    drivetrain: getVal("Drive Type"),
    bodyClass: getVal("Body Class"),
    fuelType: getVal("Fuel Type - Primary"),
  };
}
