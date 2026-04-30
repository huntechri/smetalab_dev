import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getTeamForUser, getUser } from "@/lib/data/db/queries";

const MAX_IMPORT_FILE_SIZE_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getUser();
        if (!user) {
          throw new Error("Пользователь не найден");
        }

        const team = await getTeamForUser();
        if (!team) {
          throw new Error("Команда не найдена");
        }

        if (!pathname.toLocaleLowerCase().endsWith(".xlsx")) {
          throw new Error("Поддерживается только импорт Excel (.xlsx)");
        }

        return {
          allowedContentTypes: [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/octet-stream",
          ],
          maximumSizeInBytes: MAX_IMPORT_FILE_SIZE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            userId: user.id,
            teamId: team.id,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (uploadError) {
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
