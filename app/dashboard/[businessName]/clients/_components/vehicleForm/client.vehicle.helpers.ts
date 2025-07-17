const generateYearOptions = () => {
  const endYear = new Date().getFullYear() + 1;
  const startYear = 1950;
  const years = [];
  for (let i = endYear; i >= startYear; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

const prepareVehicleInitialData = (data:any) => {
  return {
    year: data?.year ? String(data.year) : null,
    make: data?.make || null,
    model: data?.model || null,
    color: data?.color || '',
    licensePlate: data?.licensePlate || '',
    vin: data?.vin || '',
    notes: data?.notes || '',
  };
};