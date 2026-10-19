import { NextRequest, NextResponse } from "next/server";
import { globalCriteriaStore, CriteriaProfile } from "@/core/enterprise/criteria_store";
import { randomBytes } from "crypto";
import { authorizeRoles } from "@/lib/auth/auth_guard";

export async function GET(req: NextRequest) {
  const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin", "citizen"]);
  if (!auth.authorized) {
    return auth.response!;
  }

  const profiles = globalCriteriaStore.listProfiles();
  return NextResponse.json({
    success: true,
    totalProfiles: profiles.length,
    profiles,
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authorizeRoles(req, ["enterprise_admin", "super_admin"]);
    if (!auth.authorized) {
      return auth.response!;
    }

    const body = await req.json();
    const {
      name,
      category = "CUSTOM",
      description,
      minGpa,
      minLiquidFundsUsd,
      minExperienceYears,
      requiredCategories = ["academics", "experience"],
      mandatoryTier2Notarization = false,
      weights = {},
    } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "name and description are required." }, { status: 400 });
    }

    const id = `rubric_${randomBytes(4).toString("hex")}`;
    const newProfile: CriteriaProfile = {
      id,
      name,
      category,
      description,
      minGpa: minGpa ? Number(minGpa) : undefined,
      minLiquidFundsUsd: minLiquidFundsUsd ? Number(minLiquidFundsUsd) : undefined,
      minExperienceYears: minExperienceYears ? Number(minExperienceYears) : undefined,
      requiredCategories,
      mandatoryTier2Notarization: Boolean(mandatoryTier2Notarization),
      weights: {
        finance: weights.finance ? Number(weights.finance) : 25,
        academics: weights.academics ? Number(weights.academics) : 25,
        experience: weights.experience ? Number(weights.experience) : 25,
        certifications: weights.certifications ? Number(weights.certifications) : 15,
        achievements: weights.achievements ? Number(weights.achievements) : 10,
      },
      createdAt: new Date().toISOString(),
    };

    const saved = globalCriteriaStore.saveCriteriaProfile(newProfile);
    return NextResponse.json({
      success: true,
      profile: saved,
      profiles: globalCriteriaStore.listProfiles(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


