const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://10.190.139.32:3000/api/v1";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  // =====================================================
  // AMBIL TOKEN
  // =====================================================

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // =====================================================
  // CEK FORM DATA
  // =====================================================

  const isFormData =
    options.body instanceof FormData;

  // =====================================================
  // DEBUG REQUEST
  // =====================================================

  console.log(
    "========================================"
  );

  console.log(
    "API REQUEST:",
    `${API_URL}${endpoint}`
  );

  console.log(
    "API METHOD:",
    options.method || "GET"
  );

  console.log(
    "TOKEN ADA:",
    !!token
  );

  console.log(
    "TOKEN PREVIEW:",
    token
      ? `${token.substring(0, 20)}...`
      : "TIDAK ADA"
  );

  console.log(
    "IS FORM DATA:",
    isFormData
  );

  console.log(
    "========================================"
  );

  // =====================================================
  // REQUEST
  // =====================================================

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        // -------------------------------------------------
        // CONTENT TYPE
        // -------------------------------------------------

        ...(isFormData
          ? {}
          : {
              "Content-Type":
                "application/json",
            }),

        // -------------------------------------------------
        // ACCEPT
        // -------------------------------------------------

        Accept:
          "application/json",

        // -------------------------------------------------
        // AUTHORIZATION
        // -------------------------------------------------

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        // -------------------------------------------------
        // HEADER TAMBAHAN
        // -------------------------------------------------

        ...options.headers,
      },
    }
  );

  // =====================================================
  // AMBIL CONTENT TYPE RESPONSE
  // =====================================================

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  // =====================================================
  // DATA RESPONSE
  // =====================================================

  let data: any = null;

  // =====================================================
  // JSON RESPONSE
  // =====================================================

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    try {
      data =
        await response.json();
    } catch (error) {
      console.error(
        "Gagal membaca JSON response:",
        error
      );

      data = {
        message:
          "Server mengembalikan JSON yang tidak valid.",
      };
    }
  }

  // =====================================================
  // TEXT / HTML RESPONSE
  // =====================================================

  else {
    const text =
      await response.text();

    data = text
      ? {
          message: text,
        }
      : null;
  }

  // =====================================================
  // DEBUG RESPONSE
  // =====================================================

  console.log(
    "========================================"
  );

  console.log(
    "API RESPONSE"
  );

  console.log(
    "URL:",
    `${API_URL}${endpoint}`
  );

  console.log(
    "STATUS:",
    response.status
  );

  console.log(
    "STATUS TEXT:",
    response.statusText
  );

  console.log(
    "CONTENT TYPE:",
    contentType
  );

  console.log(
    "RESPONSE DATA:",
    data
  );

  console.log(
    "========================================"
  );

  // =====================================================
  // UNAUTHORIZED
  // =====================================================

  if (
    response.status === 401
  ) {
    console.error(
      "========================================"
    );

    console.error(
      "UNAUTHORIZED / TOKEN BERMASALAH"
    );

    console.error(
      "Token ada:",
      !!token
    );

    console.error(
      "Endpoint:",
      endpoint
    );

    console.error(
      "========================================"
    );

    throw new Error(
      data?.message ||
        data?.error ||
        "Unauthorized"
    );
  }

  // =====================================================
  // ERROR RESPONSE LAINNYA
  // =====================================================

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Terjadi kesalahan pada server"
    );
  }

  // =====================================================
  // RETURN DATA
  // =====================================================

  return data;
}