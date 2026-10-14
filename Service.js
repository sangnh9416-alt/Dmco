const CACHE_NAME = "employee-qr-pass-v2";

const APP_FILES = [
"./",
"./index.html",
"./manifest.json",
"./icon.svg"
];

// Cài đặt và lưu tài nguyên
self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => cache.addAll(APP_FILES))
);

self.skipWaiting();
});

// Kích hoạt và xóa cache phiên bản cũ
self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys
.filter((key) =>
key.startsWith("employee-qr-pass-") &&
key !== CACHE_NAME
)
.map((key) => caches.delete(key))
)
)
);

self.clients.claim();
});

// Tải từ cache trước, dùng mạng nếu chưa có
self.addEventListener("fetch", (event) => {
const request = event.request;

if (request.method !== "GET") return;

const url = new URL(request.url);

if (url.origin !== self.location.origin) return;

event.respondWith(
caches.match(request).then((cached) => {
if (cached) return cached;

  return fetch(request).then((response) => {
    if (response.ok && response.type === "basic") {
      const copy = response.clone();

      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, copy);
      });
    }

    return response;
  }).catch(() => {
    if (request.mode === "navigate") {
      return caches.match("./index.html");
    }

    return new Response("Không có kết nối mạng.", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  });
})

);
});
