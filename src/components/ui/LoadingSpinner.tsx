"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export default function LoadingSpinner({
  size = "md",
  color = "var(--primary)",
}: LoadingSpinnerProps) {
  const sizeMap = { sm: 20, md: 32, lg: 48 };
  const px = sizeMap[size];

  return (
    <div
      style={{
        width: px,
        height: px,
        border: `3px solid transparent`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
      role="status"
      aria-label="جاري التحميل"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
