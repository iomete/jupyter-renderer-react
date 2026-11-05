import { useEffect, useId, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { JupiterNotebookViewer } from "../components/JupyterNotebookViewer";
import type { JupyterNotebook } from "../types/notebook";
import type { JupiterNotebookViewerProps, NotebookView } from "../types/props";

import "../themes/jupyterlab-light.css";
import "../themes/jupyterlab-dark.css";
import "./notebook-json-examples.css";

// This is a saved SVG output, so switching views never executes Python.
const plotPath = Array.from({ length: 241 }, (_, index) => {
  const x = index / 24;
  return `${index === 0 ? "M" : "L"}${(40 + x * 51).toFixed(2)},${(100 - Math.sin(x) * 65).toFixed(2)}`;
}).join(" ");

const savedPlot = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="210" viewBox="0 0 600 210">
  <rect width="600" height="210" fill="#fff"/>
  <path d="M40,25V175H550 M40,100H550" fill="none" stroke="#d1d5db"/>
  <path d="${plotPath}" fill="none" stroke="#2563eb" stroke-width="2"/>
  <g fill="#4b5563" font-family="sans-serif" font-size="12">
    <text x="40" y="195" text-anchor="middle">0</text>
    <text x="295" y="195" text-anchor="middle">5</text>
    <text x="550" y="195" text-anchor="middle">10</text>
    <text x="28" y="39" text-anchor="end">1</text>
    <text x="28" y="104" text-anchor="end">0</text>
    <text x="28" y="169" text-anchor="end">−1</text>
  </g>
</svg>`;

const notebook: JupyterNotebook = {
  nbformat: 4,
  nbformat_minor: 5,
  metadata: {
    kernelspec: {
      display_name: "Python 3",
      language: "python",
      name: "python3",
    },
    language_info: { name: "python", version: "3.12.0" },
    example: { purpose: "Inspect saved notebook data", owner: "Lakehouse" },
  },
  cells: [
    {
      cell_type: "markdown",
      metadata: {},
      source: ["# Sine wave\n", "\n", "A saved plot and the code that produced it."],
    },
    {
      cell_type: "code",
      execution_count: 1,
      metadata: { tags: ["visualization"] },
      source: [
        "import matplotlib.pyplot as plt\n",
        "import numpy as np\n",
        "\n",
        "x = np.linspace(0, 10, 100)\n",
        "plt.plot(x, np.sin(x))\n",
        "plt.show()",
      ],
      outputs: [
        {
          output_type: "display_data",
          data: { "image/svg+xml": savedPlot },
          metadata: {},
        },
      ],
    },
  ],
};

const originalSource = JSON.stringify(notebook, null, 2);
const invalidSource = '{\n  "nbformat": 4,\n  "nbformat_minor": 5,\n  "metadata": {},\n  "cells": [\n';
const detailedPlotPath = Array.from({ length: 4097 }, (_, index) => {
  const x = index / 409.6;
  return `${index === 0 ? "M" : "L"}${(40 + x * 51).toFixed(3)},${(100 - Math.sin(x) * 65).toFixed(3)}`;
}).join(" ");
const detailedPlot = savedPlot.replace(plotPath, detailedPlotPath);
const largeImageSource = JSON.stringify({
  ...notebook,
  cells: notebook.cells.map(cell => cell.cell_type === "code" ? {
    ...cell,
    outputs: [{ output_type: "display_data", data: { "image/svg+xml": detailedPlot }, metadata: {} }],
  } : cell),
}, null, 2);

/**
 * This wrapper belongs to the consuming app, not the renderer package.
 * The native button and CSS are only Storybook presentation. In IOMETE, use
 * the existing UI-library Button (variant="ghost", size="sm") in this place.
 */
function ConsumerOwnedViewer(args: JupiterNotebookViewerProps) {
  const [view, setView] = useState<NotebookView>(args.view ?? "notebook");
  const contentId = useId();

  useEffect(() => setView(args.view ?? "notebook"), [args.view]);

  return (
    <section
      className="notebook-host-example"
      data-theme={args.theme === "dark" ? "dark" : "light"}
      aria-label="Notebook with an application-owned view action"
    >
      <header className="notebook-host-example__header">
        <div className="notebook-host-example__file">
          <span>analysis.ipynb</span>
          {view === "json" && (
            <span className="notebook-host-example__view">JSON source</span>
          )}
        </div>
        <button
          type="button"
          className="notebook-host-example__button"
          aria-controls={contentId}
          onClick={() => setView(current => current === "notebook" ? "json" : "notebook")}
        >
          {view === "notebook" ? "View JSON" : "View notebook"}
        </button>
      </header>
      <div id={contentId}>
        <JupiterNotebookViewer {...args} view={view} />
      </div>
    </section>
  );
}

const meta = {
  title: "Components/JupyterNotebookViewer/JSON view",
  component: JupiterNotebookViewer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The renderer accepts a controlled `view` prop. The consuming app owns the top-right View JSON / View notebook button and its styling. These examples use a Storybook-only native button; IOMETE should render its existing UI-library Button with `variant=\"ghost\"` and `size=\"sm\"`. No shadcn, Tailwind, or UI-library dependency is added to the renderer. JSON inspection preserves the supplied data before notebook normalization; a string input also remains available when parsing fails.",
      },
    },
  },
  args: {
    notebook: originalSource,
    view: "notebook",
    theme: "light",
  },
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["notebook", "json"],
      description: "The consuming app selects which representation to render.",
    },
    theme: { control: "inline-radio", options: ["light", "dark"] },
    notebook: { control: false },
  },
} satisfies Meta<typeof JupiterNotebookViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ConsumerOwnedAction: Story = {
  name: "Consumer-owned View JSON action",
  render: args => <ConsumerOwnedViewer {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "Start with the rendered notebook and use the single header action to inspect its JSON. The host retains keyboard focus on the same button while changing the `view` prop. The saved output and source arrays remain part of the same notebook.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: "Sine wave" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "View JSON" }));
    await expect(canvas.getByRole("button", { name: "View notebook" })).toBeVisible();
    await expect(canvasElement).toHaveTextContent('"nbformat"');
    await expect(canvas.queryByRole("heading", { name: "Sine wave" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "View notebook" }));
    await expect(await canvas.findByRole("heading", { name: "Sine wave" })).toBeVisible();
  },
};

export const JSONFromString: Story = {
  name: "JSON from original source",
  args: { view: "json" },
  parameters: {
    docs: {
      description: {
        story:
          "Open directly in the read-only JSON view without a package-owned toolbar. Source arrays, metadata, and saved outputs reflect the supplied JSON before normalization for notebook rendering.",
      },
    },
  },
};

export const JSONFromObject: Story = {
  name: "JSON from a notebook object",
  args: { notebook, view: "json" },
  parameters: {
    docs: {
      description: {
        story:
          "Object inputs are serialized for inspection. The renderer does not change the caller's object. Original file whitespace is unavailable for object inputs.",
      },
    },
  },
};

export const DarkJSON: Story = {
  name: "Dark JSON with host action",
  args: { view: "json", theme: "dark" },
  render: args => <ConsumerOwnedViewer {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "The JSON renderer follows the package theme. The surrounding header and action use the consuming app's styles independently.",
      },
    },
  },
};

export const MalformedSource: Story = {
  name: "Inspect source after a parsing error",
  args: { notebook: invalidSource },
  render: args => <ConsumerOwnedViewer {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          "The notebook view reports the malformed file. View JSON remains available through the host action and displays the original incomplete source as text, allowing inspection without a successful notebook parse.",
      },
    },
  },
};

export const EmbeddedImageData: Story = {
  name: "Folded embedded image data",
  args: { notebook: largeImageSource, view: "json" },
  parameters: {
    docs: {
      description: {
        story:
          "Expand the code cell's outputs to inspect `image/svg+xml`. This higher-resolution saved plot contains more than 4,000 path points. Its long image string is folded initially; expand it to reveal the complete value. Folding only affects presentation.",
      },
    },
  },
};

export const CustomJSONStyles: Story = {
  name: "Custom JSON container styling",
  args: {
    view: "json",
    classNames: { jsonSource: "notebook-host-example__custom-source" },
    styles: { jsonSource: { padding: "20px", borderRadius: "8px" } },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `classNames.jsonSource` and `styles.jsonSource` for the JSON content container. The host's Button remains a separate UI-library component rather than a styled package button.",
      },
    },
  },
};
