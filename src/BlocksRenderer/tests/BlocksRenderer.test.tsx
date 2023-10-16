import * as React from "react";
import { BlocksRenderer } from "../..";
import { render } from "@testing-library/react";

describe("BlocksRenderer", () => {
  it("should render", () => {
    render(<BlocksRenderer />);
  });
});
