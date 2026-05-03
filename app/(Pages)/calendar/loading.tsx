export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "2px solid var(--color-border-tertiary)",
          borderTopColor: "var(--brand-purple)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
