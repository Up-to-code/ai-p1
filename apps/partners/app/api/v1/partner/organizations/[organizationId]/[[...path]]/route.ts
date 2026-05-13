import { sandboxPartnerApiApp } from "@/server/sandbox/app";

export function GET(request: Request) {
  return sandboxPartnerApiApp.fetch(request);
}

export function POST(request: Request) {
  return sandboxPartnerApiApp.fetch(request);
}

export function PATCH(request: Request) {
  return sandboxPartnerApiApp.fetch(request);
}

export function PUT(request: Request) {
  return sandboxPartnerApiApp.fetch(request);
}

export function DELETE(request: Request) {
  return sandboxPartnerApiApp.fetch(request);
}
