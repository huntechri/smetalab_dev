import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getTeamForUser, getUser } from "@/lib/data/db/queries";

const MAX_IMPORT_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function createSafePathname(estimateId: string, fileName: string) {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const uniquePart = crypto.randomUUID();

  return `estimate-imports/${estimateId}/${uniquePart}-${safeFileName}`;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ estimateId: string }> },
): Promise<NextResponse> {
  try {
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

    const { estimateId } = await context.params;
    const fileName = request.nextUrl.searchParams.get("filename") ?? "import.xlsx";
    const sizeHeader = Number(request.headers.get("content-length") ?? 0);

    if (!fileName.toLocaleLowerCase().endsWith(".xlsx")) {
      return NextResponse.json(
        { success: false, message: "Поддерживается только импорт Excel (.xlsx)" },
        { status: 400 },
      );
    }

    if (sizeHeader > MAX_IMPORT_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Файл импорта слишком большой" },
        { status: 413 },
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { success: false, message: "Файл для импорта не найден" },
        { status: 400 },
      );
    }

    const pathname = createSafePathname(estimateId, fileName);
    const blob = await put(pathname, request.body, {
      access: "private",
      contentType: request.headers.get("content-type") || XLSX_CONTENT_TYPE,
      addRandomSuffix: false,
    });

    console.info("Estimate import blob uploaded through same-origin route", {
      pathname: blob.pathname,
      contentType: blob.contentType,
      url: blob.url,
      teamId: team.id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      pathname: blob.pathname,
      url: blob.url,
    });
  } catch (uploadError) {
    console.error("Estimate import blob upload error:", uploadError);

    return NextResponse.json(
      {
        success: false,
        message:
          uploadError instanceof Error
            ? uploadError.message
            : "Не удалось загрузить файл импорта",
      },
      { status: 400 },
    );
  }
}
