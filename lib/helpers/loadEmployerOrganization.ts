import { apiRequest } from "@/lib/api-client";
import { toEmployerOrganizationInfo } from "@/lib/organizationUtils";
import type { EmployerData } from "@/lib/employerDataStore";

type EmployerStores = {
  setEmployerData: (updater: (prev: EmployerData) => EmployerData) => void;
};

export async function loadEmployerOrganization(
  stores: EmployerStores
): Promise<void> {
  const organizations = await apiRequest<unknown>("/api/organizations", {
    method: "GET",
  });
  const organizationInfo = toEmployerOrganizationInfo(organizations);
  if (organizationInfo) {
    stores.setEmployerData((prev) => ({
      ...prev,
      organizationInfo: {
        ...prev.organizationInfo,
        ...organizationInfo,
      },
    }));
  }
}
