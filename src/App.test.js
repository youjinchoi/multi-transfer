import React from "react";
import { render, screen } from "@testing-library/react";

import App from "./App";

test("renders TokenBlast", () => {
  render(<App />);
  const tokenBlast = screen.getByText("TokenBlast");
  expect(tokenBlast).toBeInTheDocument();
});
