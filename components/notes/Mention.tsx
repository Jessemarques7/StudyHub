import { createReactInlineContentSpec } from "@blocknote/react";
import Link from "next/link";
import { CanvasText } from "../ui/canvas-text";

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
            {"->"}[Invalid]
          </span>
        );
      }

      return (
        <Link
          href={`/notes/${id}`}
          style={{
            textDecoration: "none",
            padding: "2px 4px",
            borderRadius: "4px",
            color: "var(--brand-purple)",
            transition: "all 0.2s ease",
            fontWeight: "bold",
          }}
          className="mention-link "
          title={`Go to: ${title}`}
        >
          <CanvasText
            text={`->${title || "Untitled"}`}
            backgroundClassName="bg-blue-700"
            colors={[
              "rgba(0, 153, 255, 1)",
              "rgba(0, 153, 255, 0.9)",
              "rgba(0, 153, 255, 0.8)",
              "rgba(0, 153, 255, 0.7)",
              "rgba(0, 153, 255, 0.6)",
              "rgba(0, 153, 255, 0.5)",
              "rgba(0, 153, 255, 0.4)",
              "rgba(0, 153, 255, 0.3)",
              "rgba(0, 153, 255, 0.2)",
              "rgba(0, 153, 255, 0.1)",
            ]}
            lineGap={4}
            animationDuration={20}
          />
        </Link>
      );
    },
  },
);
