import { getImageUrl } from "../services/api";

const VARIANT_WIDTHS = [320, 768, 1280];

function isAbsolute(imagePath) {
  return (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:"))
  );
}

export function buildResponsiveImageProps(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return {
      src: "",
      loading: "lazy",
      decoding: "async",
    };
  }

  if (isAbsolute(imagePath)) {
    return {
      src: imagePath,
      loading: "lazy",
      decoding: "async",
    };
  }

  const src = getImageUrl(imagePath);
  let srcSet;

  try {
    const lastSlash = imagePath.lastIndexOf("/");
    const dir = lastSlash >= 0 ? imagePath.slice(0, lastSlash + 1) : "";
    const filename = lastSlash >= 0 ? imagePath.slice(lastSlash + 1) : imagePath;
    const dot = filename.lastIndexOf(".");
    const baseName = dot >= 0 ? filename.slice(0, dot) : filename;

    const variants = VARIANT_WIDTHS.map((w) => {
      const variantPath = `${dir}${baseName}@${w}w.webp`;
      const url = getImageUrl(variantPath);
      return `${url} ${w}w`;
    });

    srcSet = variants.join(", ");
  } catch {
    srcSet = undefined;
  }

  return {
    src,
    srcSet,
    sizes: srcSet
      ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      : undefined,
    loading: "lazy",
    decoding: "async",
  };
}

