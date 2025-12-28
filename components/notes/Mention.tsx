import { createReactInlineContentSpec } from "@blocknote/react";
import Link from "next/link";

// Componente de menção inline
export const Mention = createReactInlineContentSpec(
  {
    type: "mention",
    propSchema: {
      // Define properties as primitives (strings), not objects
      id: {
        default: "",
      },
      title: {
        default: "Unknown",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      // Access props directly now that they are flattened
      const { id, title } = props.inlineContent.props;

      // Validação de dados
      if (!id) {
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
          href={`/notes/${id}`}
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
          title={`Go to: ${title}`}
        >
          @{title || "Untitled"}
        </Link>
      );
    },
  }
);
