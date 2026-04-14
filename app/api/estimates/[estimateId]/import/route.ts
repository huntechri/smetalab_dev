import { NextRequest, NextResponse } from "next/server";
import { getTeamForUser, getUser } from "@/lib/data/db/queries";
import { EstimateImportService } from "@/lib/services/estimate-import.service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ estimateId: string }> },
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Пользователь не найден" },
      { status: 401 },
    );
  }

  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json(
      { success: false, message: "Команда не найдена" },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "Файл для импорта не найден" },
      { status: 400 },
    );
  }

  if (!file.name.toLocaleLowerCase().endsWith(".xlsx")) {
    return NextResponse.json(
      { success: false, message: "Поддерживается только импорт Excel (.xlsx)" },
      { status: 400 },
    );
  }

  const { estimateId } = await context.params;

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const parsedResult = await EstimateImportService.parseXlsx(fileBuffer);
  if (!parsedResult.success) {
    return NextResponse.json(
      { success: false, message: parsedResult.error.message },
      { status: 400 },
    );
  }

  const importResult = await EstimateImportService.replaceRowsFromImport(
    team.id,
    estimateId,
    parsedResult.data,
  );
  if (!importResult.success) {
    const status = importResult.error.code === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json(
      { success: false, message: importResult.error.message },
      { status },
    );
  }

  return NextResponse.json({ success: true, data: importResult.data });
}
