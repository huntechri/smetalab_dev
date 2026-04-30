import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getTeamForUser, getUser } from "@/lib/data/db/queries";
import { EstimateImportService } from "@/lib/services/estimate-import.service";

export function GET() {
  return NextResponse.json(
    { success: false, message: "Метод не поддерживается" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

async function readImportFileBuffer(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as { pathname?: unknown };
    const pathname = typeof payload.pathname === "string" ? payload.pathname : "";

    if (!pathname) {
      return {
        success: false as const,
        response: NextResponse.json(
          { success: false, message: "Файл для импорта не найден" },
          { status: 400 },
        ),
      };
    }

    if (!pathname.toLocaleLowerCase().endsWith(".xlsx")) {
      return {
        success: false as const,
        response: NextResponse.json(
          { success: false, message: "Поддерживается только импорт Excel (.xlsx)" },
          { status: 400 },
        ),
      };
    }

    const blob = await get(pathname, { access: "private" });

    if (blob?.statusCode !== 200 || !blob.stream) {
      return {
        success: false as const,
        response: NextResponse.json(
          { success: false, message: "Файл импорта не найден в хранилище" },
          { status: 404 },
        ),
      };
    }

    const fileBuffer = Buffer.from(await new Response(blob.stream).arrayBuffer());
    return { success: true as const, fileBuffer };
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, message: "Файл для импорта не найден" },
        { status: 400 },
      ),
    };
  }

  if (!file.name.toLocaleLowerCase().endsWith(".xlsx")) {
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, message: "Поддерживается только импорт Excel (.xlsx)" },
        { status: 400 },
      ),
    };
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  return { success: true as const, fileBuffer };
}

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

  const readFileResult = await readImportFileBuffer(request);
  if (!readFileResult.success) {
    return readFileResult.response;
  }

  const { estimateId } = await context.params;

  const parsedResult = await EstimateImportService.parseXlsx(
    readFileResult.fileBuffer,
  );
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

  const { imported, matchingSummary } = importResult.data;

  return NextResponse.json({
    success: true,
    imported,
    matchingSummary: {
      worksMatched: matchingSummary.worksMatched,
      worksUnmatched: matchingSummary.worksUnmatched,
      materialsMatched: matchingSummary.materialsMatched,
      materialsUnmatched: matchingSummary.materialsUnmatched,
    },
  });
}
