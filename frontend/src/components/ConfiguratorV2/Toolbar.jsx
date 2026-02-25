import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { useDeviceStore } from "../../stores/useDeviceStore";
import { useCanvasStore } from "../../stores/useCanvasStore";
import {
  exportConfigJson,
  exportConfiguratorPdf,
  exportFullCompositionPng,
  exportLayerPng,
} from "../../services/exportService";

export default function Toolbar({ stageRef }) {
  const device = useDeviceStore((s) => s.device);
  const supportsPrinting = useDeviceStore((s) => s.supportsPrinting());
  const supportsLaser = useDeviceStore((s) => s.supportsLaser());
  const isCustomizationDisabled = useDeviceStore((s) => s.isCustomizationDisabled());

  const selectedElementId = useCanvasStore((s) => s.selectedElementId);
  const allowedZone = useCanvasStore((s) => s.allowedZone);
  const removeElement = useCanvasStore((s) => s.removeElement);
  const clearAll = useCanvasStore((s) => s.clearAll);
  const addText = useCanvasStore((s) => s.addText);
  const capabilityType = useCanvasStore((s) => s.capabilityType);
  const setCapabilityType = useCanvasStore((s) => s.setCapabilityType);
  const getConfigurationJson = useCanvasStore((s) => s.getConfigurationJson);
  const setBackgroundImage = useCanvasStore((s) => s.setBackgroundImage);
  const clearBackgroundImage = useCanvasStore((s) => s.clearBackgroundImage);

  const [textValue, setTextValue] = useState("");

  const canExport = Boolean(stageRef?.current && device);
  const canEdit = !isCustomizationDisabled && Boolean(allowedZone);

  const backgroundCustomizable =
    device?.raw?.backgroundCustomizable === true ||
    device?.raw?.backgroundCustomizable === "true";

  const capabilityOptions = useMemo(
    () => [
      { id: "printing", label: "Printing", enabled: supportsPrinting },
      { id: "laser", label: "Laser", enabled: supportsLaser },
    ],
    [supportsPrinting, supportsLaser]
  );

  useEffect(() => {
    const enabledOptions = capabilityOptions.filter((o) => o.enabled);
    if (!enabledOptions.length) return;
    const isCurrentEnabled = enabledOptions.some((o) => o.id === capabilityType);
    if (!isCurrentEnabled) {
      setCapabilityType(enabledOptions[0].id);
    }
  }, [capabilityOptions, capabilityType, setCapabilityType]);

  const handleAddText = () => {
    const v = String(textValue || "").trim();
    if (!v) return;
    addText(v);
    setTextValue("");
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Typography variant="h6" sx={{ mr: 1 }}>
          Configurator
        </Typography>

        <ToggleButtonGroup
          size="small"
          value={capabilityType}
          exclusive
          onChange={(_, v) => {
            if (!v) return;
            setCapabilityType(v);
          }}
        >
          {capabilityOptions.map((o) => (
            <ToggleButton key={o.id} value={o.id} disabled={!o.enabled}>
              {o.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 1, display: { xs: "none", sm: "block" } }} />

        <TextField
          size="small"
          label="Add text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddText();
          }}
          sx={{ minWidth: 260 }}
          disabled={!canEdit}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<TextFieldsIcon />}
          onClick={handleAddText}
          disabled={!canEdit}
        >
          Add
        </Button>

        <Box sx={{ flex: 1 }} />

        {backgroundCustomizable && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              mr: 1,
            }}
          >
            <Button
              size="small"
              variant="outlined"
              component="label"
              disabled={!canEdit}
            >
              Upload background
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === "string" ? reader.result : null;
                    if (result) setBackgroundImage(result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </Button>
            <Button
              size="small"
              variant="text"
              disabled={!canEdit}
              onClick={() => clearBackgroundImage()}
            >
              Clear background
            </Button>
          </Box>
        )}

        <Tooltip title="Delete selected">
          <span>
            <IconButton
              onClick={() => selectedElementId && removeElement(selectedElementId)}
              disabled={!selectedElementId || !canEdit}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Clear all">
          <span>
            <IconButton onClick={clearAll} disabled={!canEdit}>
              <RestartAltIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportLayerPng(stageRef.current, ".base-layer", "layer1-device.png")}
          disabled={!canExport}
        >
          Layer 1 PNG
        </Button>
        {backgroundCustomizable && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() =>
              exportLayerPng(stageRef.current, ".background-layer", "layer2-background.png")
            }
            disabled={!canExport}
          >
            Layer 2 PNG
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportLayerPng(stageRef.current, ".user-layer", "layer4-user.png")}
          disabled={!canExport}
        >
          Layer 4 PNG
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportFullCompositionPng(stageRef.current, "composition.png")}
          disabled={!canExport}
        >
          Full PNG
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={() => exportConfigJson(getConfigurationJson(device), "configuration.json")}
          disabled={!device}
        >
          JSON
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() =>
            exportConfiguratorPdf({
              stage: stageRef.current,
              device,
              config: getConfigurationJson(device),
            })
          }
          disabled={!canExport}
        >
          PDF
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Layers:
        </Typography>
        <Tooltip title="Layer 1 – photo of the device from the respective series (backend)">
          <Chip size="small" label="1 · Device photo" variant="outlined" />
        </Tooltip>
        <Tooltip title="Layer 2 – background image (printing only). Uses customer background if uploaded, otherwise the device default.">
          <Chip
            size="small"
            label="2 · Background"
            variant="outlined"
            color={backgroundCustomizable ? "primary" : "default"}
          />
        </Tooltip>
        <Tooltip title="Layer 3 – allowed areas for laser engraving (mask from backend). Must be present to enable editing.">
          <Chip
            size="small"
            label="3 · Engraving zone"
            variant="outlined"
            color={allowedZone ? "primary" : "default"}
          />
        </Tooltip>
        <Tooltip title="Layer 4 – client symbols and text placed in the configurator.">
          <Chip size="small" label="4 · Icons & text" variant="outlined" />
        </Tooltip>
      </Box>
    </Box>
  );
}

