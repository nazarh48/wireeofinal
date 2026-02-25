import { apiService, getImageUrl } from "../services/api";

const coerceBool = (v) => v === true || v === "true" || v === 1 || v === "1";

/**
 * Device is modeled by a configurable Product (admin-driven).
 * Maps backend Product -> Device capability structure required by the Configurator.
 */
export async function fetchDeviceById(deviceId) {
  const res = await apiService.products.getById(deviceId);
  const product = res?.product || null;
  if (!product) {
    const err = new Error("Device not found");
    err.code = "DEVICE_NOT_FOUND";
    throw err;
  }

  const supportsPrinting = coerceBool(product.printingEnabled);
  const supportsLaser = coerceBool(product.laserEnabled);

  const layer1 = product.baseDeviceImageUrl || product.configuratorImageUrl || product.baseImageUrl || "";
  const layer2 = product.configuratorImageUrl || product.baseImageUrl || "";
  const layer3 = product.engravingMaskImageUrl || "";

  return {
    id: product.id || product._id,
    name: product.name || "",
    supports_printing: supportsPrinting,
    supports_laser: supportsLaser,
    layer1_image: getImageUrl(layer1),
    layer2_image: getImageUrl(layer2),
    layer3_image: getImageUrl(layer3),
    raw: product,
  };
}

