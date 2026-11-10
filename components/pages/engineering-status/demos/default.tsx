import { EngineeringStatus } from "../index";
import { brand, healthyServices, NOW, resolvedIncidents } from "./data";

export default function Demo() {
  return (
    <EngineeringStatus
      brand={brand}
      services={healthyServices}
      incidents={resolvedIncidents}
      now={NOW}
    />
  );
}
