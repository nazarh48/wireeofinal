import { useSearchParams } from "react-router-dom";
import RequireAuth from "../components/auth/RequireAuth";
import ProductsRanges from "./ProductsRanges";
import TabbedRanges from "./TabbedRanges";

const ProductsRangesRoute = () => {
  const [searchParams] = useSearchParams();
  const shouldOpenConfigurator =
    searchParams.has("tab") ||
    searchParams.has("projectId") ||
    searchParams.has("rangeId");

  if (shouldOpenConfigurator) {
    return (
      <RequireAuth>
        <TabbedRanges />
      </RequireAuth>
    );
  }

  return <ProductsRanges />;
};

export default ProductsRangesRoute;
