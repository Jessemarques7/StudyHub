import { createReactInlineContentSpec } from "@blocknote/react";
import Link from "next/link";

// The Mention inline content.
export const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      note: {
        default: "Unknown",
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <Link
        href={`/notes/${props.inlineContent.props.note.id}`}
        style={{
          backgroundColor: "#8400ff33",
          textDecoration: "none",
          padding: "2px 4px",
          borderRadius: "4px",
          color: "#cfcfcf",
        }}
      >
        @{props.inlineContent.props.note.title}
      </Link>
    ),
  }
);
