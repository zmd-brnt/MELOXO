import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { api } from "../../api/client";
import { renderApp, routes } from "../../test-utils";
import { Catalog } from "./Catalog";

vi.mock("../../api/client", async (original) => ({
  ...(await original<typeof import("../../api/client")>()),
  api: vi.fn(),
}));

const job = { id: "j1", status: "running", params: {}, offset: 0, imported: 37, error: null, created_at: "2026-11-01T00:00:00Z" };

beforeEach(() => {
  vi.mocked(api).mockReset();
  vi.mocked(api).mockImplementation(
    routes({
      "GET /api/admin/songs": { items: [], total: 0, page: 1, size: 20 },
      "GET /api/admin/catalog/import": [],
      "POST /api/admin/catalog/import": { job_id: "j1" },
      "GET /api/admin/catalog/import/j1": job,
    }),
  );
});

test("importación muestra avance consultando job_id", async () => {
  renderApp(<Catalog />);
  await userEvent.type(screen.getByLabelText("Géneros"), "rock, jazz");
  await userEvent.click(screen.getByRole("button", { name: "Importar de Jamendo" }));
  expect(api).toHaveBeenCalledWith(
    "/api/admin/catalog/import",
    expect.objectContaining({ json: { genres: ["rock", "jazz"], limit_per_genre: 50 } }),
  );
  expect(await screen.findByText("En curso: 37 pistas importadas")).toBeInTheDocument();
  expect(api).toHaveBeenCalledWith("/api/admin/catalog/import/j1");
});
