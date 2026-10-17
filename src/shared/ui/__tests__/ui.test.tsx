import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "../button";
import { ButtonLink } from "../button-link";
import { buttonClassName } from "../button-styles";
import { Checkbox } from "../checkbox";
import { EmptyState } from "../empty-state";
import { Select } from "../select";
import { TextField } from "../text-field";

describe("shared UI", () => {
  it("renders buttons, links, and the disabled class", () => {
    render(
      <>
        <Button>Save</Button>
        <Button variant="primary" size="compact" disabled>
          Wait
        </Button>
        <ButtonLink href="/compare" variant="primary">
          Compare
        </ButtonLink>
      </>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Wait" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Compare" })).toHaveAttribute("href", "/compare");
    expect(
      buttonClassName({ variant: "primary", size: "compact", interactive: false }),
    ).not.toContain("cursor-pointer");
  });

  it("reports checkbox, select, and text changes", () => {
    const onCheck = vi.fn();
    const onSelect = vi.fn();
    const onText = vi.fn();
    const onBlur = vi.fn();

    render(
      <>
        <Checkbox label="Toyota" checked={false} onChange={onCheck} />
        <Select id="choice" label="Choice" value="" onChange={onSelect}>
          <option value="">Pick</option>
          <option value="honda">Honda</option>
        </Select>
        <TextField
          id="min-price"
          label="Minimum price"
          value=""
          onChange={onText}
          onBlur={onBlur}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Toyota" }));
    fireEvent.change(screen.getByLabelText("Choice"), { target: { value: "honda" } });
    fireEvent.change(screen.getByLabelText("Minimum price"), { target: { value: "12" } });
    fireEvent.blur(screen.getByLabelText("Minimum price"));

    expect(onCheck).toHaveBeenCalledWith(true);
    expect(onSelect).toHaveBeenCalled();
    expect(onText).toHaveBeenCalledWith("12");
    expect(onBlur).toHaveBeenCalled();
  });

  it("shows an empty state with and without an action", () => {
    const { rerender } = render(
      <EmptyState title="Nothing here" description="Try another filter." />,
    );

    expect(screen.getByRole("heading", { name: "Nothing here" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(
      <EmptyState
        title="Nothing here"
        description="Try another filter."
        action={{ href: "/", label: "Clear filters" }}
      />,
    );

    expect(screen.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/");
  });
});
