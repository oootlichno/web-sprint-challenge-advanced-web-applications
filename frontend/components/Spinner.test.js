import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Spinner from "./Spinner";

test("Spinner renders correctly", () => {
  render(<Spinner />);
});

test('Spinner renders correctly when "on" is true', async () => {
  render(<Spinner on={true} />);

  await waitFor(() => {
    const spinnerElement = screen.queryByText(/Please wait.../i);
    expect(spinnerElement).toBeInTheDocument;
  });
});

test('Spinner does not render when "on" is false', () => {
  render(<Spinner on={false} />);
  const spinnerElement = screen.queryByText(/Please wait.../i);
  expect(spinnerElement).toBeNull();
});
