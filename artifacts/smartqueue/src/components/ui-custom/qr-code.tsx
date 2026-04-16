import { QRCodeSVG } from "qrcode.react";

export function QRCodeDisplay({ value, size = 128 }: { value: string, size?: number }) {
  return (
    <div className="bg-white p-2 rounded-md inline-block">
      <QRCodeSVG value={value} size={size} />
    </div>
  );
}
