const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.200.193:3000/api/v1";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;


  const isFormData =
    options.body instanceof FormData;


  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        ...(isFormData
          ? {}
          : {
              "Content-Type":
                "application/json",
            }),

        Accept:
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...options.headers,
      },
    }
  );


  const contentType =
    response.headers.get(
      "content-type"
    );


  let data: any = null;


  if (
    contentType?.includes(
      "application/json"
    )
  ) {
    data =
      await response.json();

  } else {

    const text =
      await response.text();

    data = text
      ? {
          message: text,
        }
      : null;
  }


  // =====================================================
  // DEBUG RESPONSE API
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
    "IS FORM DATA:",
    isFormData
  );

  console.log(
    "API STATUS:",
    response.status
  );

  console.log(
    "API RESPONSE:"
  );

  console.log(
    JSON.stringify(
      data,
      null,
      2
    )
  );

  console.log(
    "========================================"
  );


  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      "Terjadi kesalahan pada server"
    );
  }


  return data;
}