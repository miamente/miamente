import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import React from "react";

import Home from "../page";

describe("Home accessibility", () => {
  it("renders CTA and has no obvious a11y violations", async () => {
    render(
      <main role="main">
        <Home />
      </main>,
    );
    expect(screen.getByRole("heading", { name: /Bienestar mental/i })).toBeInTheDocument();
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
