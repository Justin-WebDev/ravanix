// lib/data-access-layer/vehicle-data/makes.ts

const NHTSA_API_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export async function fetchVehicleMakes(year = 0) {
  // This endpoint now fetches makes for a specific vehicle type, e.g., "car"
  // It does not require a year parameter from the client for this initial make list.
  // Or you could make this a parameter if you support other types
  // https://vpic.nhtsa.dot.gov/api/vehicles/GetAllManufacturers?ManufacturerType=Complete&VehicleType=car&format=json
  // /vehicles/GetMakesForVehicleType/car?format=json
  const vehicleTypeName = 'car';
  const nhtsaApiUrl = `${NHTSA_API_BASE_URL}/GetMakesForVehicleType/${vehicleTypeName}?format=json`;

  try {
    const response = await fetch(nhtsaApiUrl);
    const responseBodyText = await response.text();

    if (!response.ok) {
      let nhtsaErrorMessage = `NHTSA API returned status ${response.status}`;

      try {
        const errorData = JSON.parse(responseBodyText);
        if (errorData && errorData.Message) {
          nhtsaErrorMessage = errorData.Message;
        } else if (
          errorData &&
          errorData.Results &&
          errorData.Results.length > 0 &&
          errorData.Results[0]?.Message
        ) {
          nhtsaErrorMessage = errorData.Results[0].Message;
        }
      } catch (error) {
        /* Failed to parse error body as JSON */
      }
    }
    let data;
    try {
      data = JSON.parse(responseBodyText);
    } catch (error) {
      console.error(
        `Failed to parse NHTSA JSON response. Response Body: ${responseBodyText}`
      );
    }

    const validResults = data.Results.filter(
      (make: any) =>
        make.MakeName &&
        make.MakeName.trim() !== '' &&
        make.MakeName.trim().toLowerCase() !== 'n/a' &&
        make.MakeId !== 0
    );

    const makes = validResults
      .map((make: any) => ({
        value: make.MakeName.trim(),
        label: make.MakeName.trim(),
        // originalMakeId: make.MakeId // Optional: if you want to store/use the ID later
      }))
      //.sort((a, b) => a.label.localeCompare(b.label));
      .sort(
        (
          a: { value: string; label: string },
          b: { value: string; label: string }
        ) => (a.label < b.label ? -1 : 1)
      );

    const uniqueMakes = makes.filter(
      (make: any, index: any, self: any) =>
        index ===
        self.findIndex(
          (m: any) => m.label.toLowerCase() === make.label.toLowerCase()
        )
    );

    return uniqueMakes;
  } catch (error) {
    console.error(
      `[API /vehicle-data/makes] Internal server error fetching makes:`,
      error
    );
  }
}
