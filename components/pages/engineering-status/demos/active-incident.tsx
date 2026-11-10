import { EngineeringStatus } from "../index";
import { activeIncident, brand, incidentServices, NOW, resolvedIncidents } from "./data";

export default function Demo() {
  return (
    <EngineeringStatus
      brand={brand}
      services={incidentServices}
      incidents={[activeIncident, ...resolvedIncidents]}
      now={NOW}
    />
  );
}
