import { createReactInlineContentSpec } from "@blocknote/react";
import Link from "next/link";
import { MentionProps } from "@/types/notes";

// Componente de menção inline
export const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      note: {
        default: {
          id: "",
          title: "Unknown",
        },
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const noteData = props.inlineContent.props.note as MentionProps["note"];

      // Validação de dados
      if (!noteData || !noteData.id) {
        return (
          <span
            style={{
              backgroundColor: "#ff000033",
              padding: "2px 4px",
              borderRadius: "4px",
              color: "#ff6b6b",
            }}
            title="Invalid mention"
          >
            @[Invalid]
          </span>
        );
      }

      return (
        <Link
          href={`/notes/${noteData.id}`}
          style={{
            // backgroundColor: "#9124ff",
            textDecoration: "none",
            padding: "2px 4px",
            borderRadius: "4px",
            color: "#9124ff",
            transition: "all 0.2s ease",
            fontWeight: "bold",
          }}
          className="mention-link "
          title={`Go to: ${noteData.title}`}
        >
          @{noteData.title || "Untitled"}
        </Link>
      );
    },
  }
);
