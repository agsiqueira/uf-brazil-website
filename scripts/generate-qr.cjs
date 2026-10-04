const QRCode = require("qrcode");
QRCode.toFile(
  "assets/signup-qr.png",
  "https://uf-brazil.mixed.group/signup.html",
  {
    width: 360,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#163b3c", light: "#ffffff" },
  },
).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
