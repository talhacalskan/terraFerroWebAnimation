import { supabase } from "./supabase"; // Supabase bağlantımızı içeri alıyoruz

// İŞTE DEĞİŞİKLİK BURADA: localhost yerine Railway canlı sunucun eklendi
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://terraferrowebanimation-production.up.railway.app";

async function parseError(response: Response, fallback: string) {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string" && body.detail.length > 0) {
      return body.detail;
    }
  } catch {
    // Ignore parse errors and use fallback message.
  }
  return fallback;
}

// VIP Kartını (Token) cebimizden çıkaran yardımcı fonksiyon
async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {}; // Eğer giriş yapılmamışsa boş döner (zaten Next.js koruması içeri almamıştır)
}

export type AnnouncementRecord = {
  id: string;
  title: string;
  content: string;
  media_data: Array<{
    url: string;
    type: "image" | "video";
    mime_type?: string;
    poster_url?: string;
    thumb_url?: string;
    filename?: string;
  }>;
  created_at: string;
  is_active: boolean;
};

// GET: Buna kilit YOK. Herkes görebilir.
export async function fetchAnnouncements(options?: {
  activeOnly?: boolean;
}): Promise<AnnouncementRecord[]> {
  const query = new URLSearchParams();
  if (typeof options?.activeOnly === "boolean") {
    query.set("active_only", String(options.activeOnly));
  }

  const response = await fetch(
    `${API_BASE}/announcements${query.size > 0 ? `?${query.toString()}` : ""}`,
    {
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new Error(await parseError(response, "Duyurular getirilemedi."));
  }
  return response.json();
}

// POST: Kilit VAR.
export async function createAnnouncement(payload: {
  title: string;
  content: string;
  media_data: AnnouncementRecord["media_data"];
  is_active: boolean;
}) {
  const response = await fetch(`${API_BASE}/announcements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()), // VIP Kartı zarfa ekleniyor
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Duyuru kaydedilemedi."));
  }

  return response.json();
}

// PUT: Kilit VAR.
export async function updateAnnouncement(
  announcementId: string,
  payload: {
    title: string;
    content: string;
    media_data: AnnouncementRecord["media_data"];
    is_active: boolean;
  },
) {
  const response = await fetch(`${API_BASE}/announcements/${announcementId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()), // VIP Kartı zarfa ekleniyor
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Duyuru güncellenemedi."));
  }

  return response.json();
}

// DELETE: Kilit VAR.
export async function deleteAnnouncement(announcementId: string) {
  const response = await fetch(`${API_BASE}/announcements/${announcementId}`, {
    method: "DELETE",
    headers: {
      ...(await getAuthHeaders()), // VIP Kartı zarfa ekleniyor
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Duyuru silinemedi."));
  }

  return response.json();
}

// R2 UPLOAD İŞLEMLERİ (Aşağıdakilerin hepsinde Kilit VAR)
export async function getPresignedUpload(payload: {
  filename: string;
  content_type: string;
  size: number;
}) {
  const response = await fetch(`${API_BASE}/announcements/uploads/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await getAuthHeaders()),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create upload session");
  }

  return response.json() as Promise<
    | { mode: "single"; key: string; uploadUrl: string; publicUrl: string }
    | {
        mode: "multipart";
        key: string;
        uploadId: string;
        partUrls: Array<{ partNumber: number; url: string }>;
        publicUrl: string;
      }
  >;
}

export async function getMultipartPartUrl(payload: {
  key: string;
  uploadId: string;
  part_number: number;
}) {
  const response = await fetch(
    `${API_BASE}/announcements/uploads/multipart/part-url?${new URLSearchParams(
      {
        key: payload.key,
        upload_id: payload.uploadId,
        part_number: String(payload.part_number),
      },
    ).toString()}`,
    {
      method: "POST",
      headers: {
        ...(await getAuthHeaders()),
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get multipart part url");
  }

  return response.json() as Promise<{ url: string }>;
}

export async function completeMultipartUpload(payload: {
  key: string;
  uploadId: string;
  parts: Array<{ ETag: string; PartNumber: number }>;
}) {
  const response = await fetch(
    `${API_BASE}/announcements/uploads/multipart/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({
        key: payload.key,
        upload_id: payload.uploadId,
        parts: payload.parts,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to complete multipart upload");
  }

  return response.json() as Promise<{ ok: true; publicUrl: string }>;
}
