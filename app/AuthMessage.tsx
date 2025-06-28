import type { AuthMessage as AuthMessageType } from "./routes/auth/layout";

export default function AuthMessage({
  message,
}: {
  message: AuthMessageType | null;
}) {
  return (
    <>
      {message && (
        <div
          className={`text-sm mb-2 ${
            message.type === "error" ? "text-red-400" : "text-green-400"
          }`}
        >
          {message.content}
        </div>
      )}
    </>
  );
}
