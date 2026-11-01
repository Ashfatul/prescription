import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromCookie } from "@/lib/auth/session";
import { RoleName } from "@prisma/client";
import { 
  getHospitalSettings, 
  updateHospitalSettings 
} from "@/features/settings/settings.service";

export async function GET() {
  try {
    const settings = await getHospitalSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve hospital settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUserFromCookie();
    if (!user || user.role.name !== RoleName.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Super Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const updated = await updateHospitalSettings(body);
    return NextResponse.json({
      success: true,
      message: "Hospital & Chamber settings updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update hospital settings" },
      { status: 500 }
    );
  }
}
