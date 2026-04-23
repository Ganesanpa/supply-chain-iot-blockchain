import { QRCodeCanvas } from "qrcode.react";

function BatchQRCode({ batchId }) {

  const verifyURL = `${window.location.origin}/verify/${batchId}`;

  return (
    <div className="text-center space-y-2">

      <QRCodeCanvas
        value={verifyURL}
        size={120}
      />

      <p className="text-xs text-gray-500">
        Scan to verify product
      </p>

    </div>
  );
}

export default BatchQRCode;