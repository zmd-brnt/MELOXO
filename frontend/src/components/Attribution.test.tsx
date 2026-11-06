import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { song } from "../test-utils";
import { Attribution } from "./Attribution";

test("Attribution de Jamendo muestra artista, Jamendo, licencia y enlace a la pista", () => {
  render(
    <Attribution
      song={song({
        source: "jamendo",
        jamendo_url: "https://www.jamendo.com/track/1",
        license: "CC BY-NC-SA",
        license_url: "https://creativecommons.org/licenses/by-nc-sa/3.0/",
      })}
    />,
  );
  expect(screen.getByText(/Marea Baja/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Jamendo" })).toHaveAttribute("href", "https://www.jamendo.com/track/1");
  expect(screen.getByRole("link", { name: "CC BY-NC-SA" })).toHaveAttribute(
    "href",
    "https://creativecommons.org/licenses/by-nc-sa/3.0/",
  );
});

test("Attribution local muestra artista y licencia, sin Jamendo", () => {
  render(<Attribution song={song()} />);
  expect(screen.getByText(/Marea Baja · CC BY/)).toBeInTheDocument();
  expect(screen.queryByText("Jamendo")).not.toBeInTheDocument();
});
