import {
  ensureCandidateProfileSlug,
  fetchCandidateProfileFull,
} from "@/lib/candidateProfile";
import { mapCandidateProfileToUserData } from "@/lib/candidateProfileUtils";

type ProfileStores = {
  resetProfile: () => void;
  setSlug: (slug: string | null) => void;
  setProfile: (profile: Record<string, unknown> | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  patchUserData: (patch: Partial<Record<string, unknown>>) => void;
};

export async function loadCandidateProfileAndSync(
  stores: ProfileStores,
  logLabel: string
): Promise<void> {
  stores.resetProfile();
  stores.setLoading(true);
  stores.setError(null);
  try {
    const slug = await ensureCandidateProfileSlug({ logLabel });
    if (slug) {
      stores.setSlug(slug);
      const profile = await fetchCandidateProfileFull(slug, logLabel);
      if (profile) {
        stores.setProfile(profile);
        const mapped = mapCandidateProfileToUserData(profile);
        if (Object.keys(mapped).length > 0) {
          stores.patchUserData(mapped);
        }
      } else {
        stores.setError("Unable to load candidate profile.");
      }
    } else {
      stores.setError("Unable to load candidate profile.");
    }
  } finally {
    stores.setLoading(false);
  }
}
