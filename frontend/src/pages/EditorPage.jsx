// src/pages/EditorPage.jsx
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import useStore from '../store/useStore';
import Configurator from '../components/configurator/Configurator';
import EditedProductPreview from '../components/EditedProductPreview';
import {
  buildLayerPreviewEdits,
  buildLayerPreviewProduct,
} from '../utils/configurationPreview';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const EditorPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getConfigurableProductById, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();
  const setProduct = useStore((s) => s.setProduct);
  const fetchCollection = useStore((s) => s.fetchCollection);
  const configurator = useStore((s) => s.configurator);

  const instanceId = searchParams.get('instanceId') || null;

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const product = getConfigurableProductById(productId);
  const range = product ? getRangeById(product.rangeId) : null;

  const isFromProjects = window.location.search.includes('from=projects');

  useEffect(() => {
    let cancelled = false;
    const hydrateAndSet = async () => {
      if (!product) return;
      // Ensure instance edits are available before opening editor from collection.
      if (instanceId && window.location.search.includes('from=collection')) {
        try {
          await fetchCollection();
        } catch {
          // Continue with available local state; setProduct has fallback hydration.
        }
      }
      if (cancelled) return;
      setProduct(product, instanceId);
    };
    hydrateAndSet();
    return () => {
      cancelled = true;
    };
  }, [product, setProduct, productId, instanceId, fetchCollection]);

  if (loading && !loaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!product || !range) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  const backgroundCustomizable =
    product?.backgroundCustomizable === true || product?.backgroundCustomizable === 'true';
  const asBool = (v) => v === true || v === "true" || v === 1 || v === "1";
  const backgroundEnabled =
    product?.backgroundEnabled !== undefined ? asBool(product?.backgroundEnabled) : backgroundCustomizable;
  const laserEnabled =
    product?.laserEnabled === true || product?.laserEnabled === 'true';
  const printingEnabled =
    product?.printingEnabled === true || product?.printingEnabled === 'true';

  let processingLabel = 'Configuration';
  if (laserEnabled && !printingEnabled) {
    processingLabel = 'Laser engraving';
  } else if (printingEnabled && !laserEnabled) {
    processingLabel = 'Colour printing';
  } else if (laserEnabled && printingEnabled) {
    processingLabel = 'Laser + printing';
  }

  const previewProduct = configurator.product || product;
  const previewEdits = useMemo(
    () => ({
      elements: configurator.elements || [],
      configuration: configurator.configuration || {},
    }),
    [configurator.configuration, configurator.elements],
  );

  const flowCards = [
    {
      id: 'complete',
      title: 'Complete Photo',
      description: 'Combined result of the configured device, optional background, and all editor elements.',
      product: buildLayerPreviewProduct(previewProduct, 'complete'),
      edits: buildLayerPreviewEdits(previewEdits, 'complete'),
    },
    {
      id: 'printing',
      title: 'Printing Layer',
      description: 'Preview of the printable content used in the configuration flow.',
      product: buildLayerPreviewProduct(previewProduct, 'printing'),
      edits: buildLayerPreviewEdits(previewEdits, 'printing'),
    },
    {
      id: 'background',
      title: 'Background Layer',
      description: 'User background only, without the device base image.',
      product: buildLayerPreviewProduct(previewProduct, 'background'),
      edits: buildLayerPreviewEdits(previewEdits, 'background'),
    },
    {
      id: 'laser',
      title: 'Laser Layer',
      description: 'Preview of the engraving output used in the configuration flow.',
      product: buildLayerPreviewProduct(previewProduct, 'laser'),
      edits: buildLayerPreviewEdits(previewEdits, 'laser'),
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100">
      <div className="border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur flex-shrink-0">
        <div className="px-3 sm:px-4 lg:px-6">
          <div className="flex min-h-[60px] items-center justify-between gap-3 py-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() =>
                  navigate(
                    isFromProjects
                      ? '/products/ranges?tab=projects'
                      : '/products/ranges?tab=collection'
                  )
                }
                className="inline-flex h-9 items-center rounded-lg border border-teal-200 bg-white px-3 text-sm font-medium text-teal-700 shadow-sm transition-colors hover:bg-teal-50 hover:text-teal-800 flex-shrink-0"
              >
                ← Back
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                  {product.name}
                </h1>
                <p className="text-xs text-slate-500 truncate">
                  • {product.productCode}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs text-slate-600">
                  <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 font-medium text-teal-800">
                    {processingLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
                    {backgroundEnabled
                      ? 'Background customizable'
                      : 'This product is not available for background customization.'}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 lg:block">
              ID: {product.id}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-2 sm:p-3">
        <Configurator navigate={navigate} isFromProjects={isFromProjects} instanceId={instanceId} />
      </div>
    </div>
  );
};

export default EditorPage;