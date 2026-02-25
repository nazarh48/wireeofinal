import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import { useDeviceStore } from "../stores/useDeviceStore";
import { useCanvasStore } from "../stores/useCanvasStore";
import { ConfiguratorCanvas } from "../components/ConfiguratorV2/ConfiguratorCanvas";
import IconSidebar from "../components/ConfiguratorV2/IconSidebar";
import Toolbar from "../components/ConfiguratorV2/Toolbar";

export default function ConfiguratorPage() {
  const { productId } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const stageRef = useRef(null);

  const device = useDeviceStore((s) => s.device);
  const isLoading = useDeviceStore((s) => s.isLoading);
  const error = useDeviceStore((s) => s.error);
  const fetchDevice = useDeviceStore((s) => s.fetchDevice);
  const isCustomizationDisabled = useDeviceStore((s) => s.isCustomizationDisabled());
  const allowedZone = useCanvasStore((s) => s.allowedZone);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!productId) return;
    fetchDevice(productId);
  }, [productId, fetchDevice]);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const canvasSize = useMemo(() => {
    // Keep a predictable aspect ratio but remain responsive.
    return { width: 900, height: 560 };
  }, []);

  if (isLoading && !device) {
    return (
      <Box sx={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !device) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load device. Please try again.</Alert>
      </Box>
    );
  }

  if (!device) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Device not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "calc(100vh - 64px)" }}>
      <Toolbar stageRef={stageRef} />

      {isCustomizationDisabled && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="info">
            This device does not support printing or laser customization. Customization tools are disabled.
          </Alert>
        </Box>
      )}
      {!isCustomizationDisabled && !allowedZone && (
        <Box sx={{ px: 2, pt: 2 }}>
          <Alert severity="warning">
            Customization zone could not be determined from the device mask (Layer 3). Editing is disabled until a valid mask is provided.
          </Alert>
        </Box>
      )}

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        {isMobile ? (
          <>
            <Box sx={{ position: "absolute", zIndex: 10, mt: 1, ml: 1 }}>
              <IconButton onClick={() => setSidebarOpen(true)} aria-label="Open icon library">
                <MenuIcon />
              </IconButton>
            </Box>
            <Drawer
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              PaperProps={{ sx: { width: 320 } }}
            >
              <IconSidebar />
            </Drawer>
          </>
        ) : (
          <IconSidebar />
        )}

        {/* Main */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            p: { xs: 1.5, md: 2.5 },
            gap: 1.5,
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
                {device.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Capabilities: {device.supports_printing ? "printing" : ""}{device.supports_printing && device.supports_laser ? " + " : ""}{device.supports_laser ? "laser" : ""}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <ConfiguratorCanvas
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

